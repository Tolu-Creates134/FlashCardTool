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

        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException("Current user identifier is required.");

        var deckRepository = unitOfWork.Repository<Deck>();
        var flashCardRepository = unitOfWork.Repository<FlashCard>();
        var categoryRepository = unitOfWork.Repository<Category>();

        // Step 1 — find deck without includes
        var existingDeck = await deckRepository.FirstOrDefaultAsync(
            d => d.Id == request.DeckId,
            cancellationToken
        );

        if (existingDeck is null)
        {
            throw new EntityNotFoundException("Deck", request.DeckId.ToString());
        }

        // Step 2 — load current category separately
        var currentCategory = await categoryRepository.FirstOrDefaultAsync(
            c => c.Id == existingDeck.CategoryId,
            cancellationToken
        );

        if (currentCategory is null || currentCategory.UserId != userId)
        {
            throw new ForbiddenOperationException("Cannot update a deck that does not belong to the current user.");
        }

        // Step 3 — load target category
        var targetCategory = await categoryRepository.FirstOrDefaultAsync(
            c => c.Id == request.Deck.CategoryId,
            cancellationToken
        );

        if (targetCategory is null)
        {
            throw new EntityNotFoundException("Category", request.Deck.CategoryId.ToString());
        }

        if (targetCategory.UserId != userId)
        {
            throw new ForbiddenOperationException("Cannot move a deck to a category that does not belong to the current user.");
        }

        // Step 4 — track if category is changing
        var categoryIsChanging = existingDeck.CategoryId != targetCategory.Id;

        // Step 5 — update deck properties
        existingDeck.Name = request.Deck.Name;
        existingDeck.Description = request.Deck.Description;
        existingDeck.CategoryId = targetCategory.Id;

        // Step 6 — load flashcards separately
        var existingFlashcards = await flashCardRepository.ListAsync(
            fc => fc.DeckId == existingDeck.Id,
            cancellationToken
        );

        // Step 7 — sync flashcards
        var flashcardsById = existingFlashcards.ToDictionary(fc => fc.Id);
        var incomingIds = new HashSet<Guid>();

        foreach (var flashCardDto in request.Deck.FlashCards ?? Enumerable.Empty<FlashCardDto>())
        {
            if (flashCardDto.Id.HasValue && flashcardsById.TryGetValue(flashCardDto.Id.Value, out var existingCard))
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

        // Step 8 — remove deleted flashcards
        var toRemove = existingFlashcards
        .Where(fc => !incomingIds.Contains(fc.Id))
        .ToList();

        foreach (var flashCard in toRemove)
        {
            flashCardRepository.Remove(flashCard);
        }

        // Step 9 — update deck
        await deckRepository.UpdateAsync(existingDeck, cancellationToken);

        // Step 10 — handle orphaned category
        if (categoryIsChanging)
        {
            var remainingDecksInOldCategory = await deckRepository.CountAsync(
                d => d.CategoryId == currentCategory.Id,
                cancellationToken
            );

            // Old category now has no decks — delete it
            if (remainingDecksInOldCategory == 1)
            {
                categoryRepository.Remove(currentCategory);
            }
        }
        
        await unitOfWork.SaveChangesAsync();
    }
}
