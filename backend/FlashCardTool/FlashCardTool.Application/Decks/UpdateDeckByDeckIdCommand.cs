using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.Decks;

public record UpdateDeckByDeckIdCommand(Guid DeckId, DeckDto Deck) : IRequest;

public class UpdateDeckByDeckIdCommandHandler : IRequestHandler<UpdateDeckByDeckIdCommand>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;

    public UpdateDeckByDeckIdCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
        this.currentUserService = currentUserService;

        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(mapper);
        ArgumentNullException.ThrowIfNull(currentUserService);
    }

    public async Task Handle(UpdateDeckByDeckIdCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        var deckRepository = unitOfWork.Repository<Deck>();
        var flashCardRepository = unitOfWork.Repository<FlashCard>();
        var categoryRepository = unitOfWork.Repository<Category>();

        var existingDeck = await deckRepository.FirstOrDefaultAsync(
            d => d.Id == request.DeckId,
            query => query
                .Include(d => d.Category)
                .Include(d => d.Flashcards),
                cancellationToken
        );

        if (existingDeck is null)
        {
            throw new EntityNotFoundException("Deck", request.DeckId.ToString());
        }

        if (existingDeck.Category is null || existingDeck.Category.UserId != userId)
        {
            throw new InvalidOperationException("Cannot update a deck that does not belong to the current user.");
        }

        var category = await categoryRepository.FirstOrDefaultAsync(
            c => c.Id == request.Deck.CategoryId,
            cancellationToken
        );

        if (category is null)
        {
            throw new EntityNotFoundException("Category", request.Deck.CategoryId.ToString());
        }

        if (category.UserId != userId)
        {
            throw new InvalidOperationException("Cannot move a deck to a category that does not belong to the current user.");
        }

        existingDeck.Name = request.Deck.Name;
        existingDeck.Description = request.Deck.Description;
        existingDeck.CategoryId = category.Id;

        var existingFlashcards = existingDeck.Flashcards.ToDictionary(fc => fc.Id, fc => fc);
        var incomingIds = new HashSet<Guid>();


        foreach (var flashCardDto in request.Deck.FlashCards ?? Enumerable.Empty<FlashCardDto>())
        {
            if (flashCardDto.Id.HasValue && existingFlashcards.TryGetValue(flashCardDto.Id.Value, out var existingCard))
            {
                existingCard.Question = flashCardDto.Question;
                existingCard.Answer = flashCardDto.Answer;
                incomingIds.Add(existingCard.Id);
                continue;
            }

            var newFlashCard = mapper.Map<FlashCard>(flashCardDto);
            newFlashCard.DeckId = existingDeck.Id;

            existingDeck.Flashcards.Add(newFlashCard);
            incomingIds.Add(newFlashCard.Id);
        }

        var toRemove = existingDeck.Flashcards.Where(fc => !incomingIds.Contains(fc.Id)).ToList();
        foreach(var flashCard in toRemove)
        {
            flashCardRepository.Remove(flashCard);
        }

        await deckRepository.UpdateAsync(existingDeck, cancellationToken);
        await unitOfWork.SaveChangesAsync();
    }
}
