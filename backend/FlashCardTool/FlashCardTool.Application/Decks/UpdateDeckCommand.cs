using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.Decks;

public record UpdateDeckCommand(Guid DeckId, DeckDto Deck) : IRequest;

public class UpdateDeckCommandHandler : IRequestHandler<UpdateDeckCommand>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;

    public UpdateDeckCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
    }

    public async Task Handle(UpdateDeckCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(mapper);
        ArgumentNullException.ThrowIfNull(request);

        var deckRepo = unitOfWork.Repository<Deck>();

        ArgumentNullException.ThrowIfNull(deckRepo);

        var deck = await deckRepo
        .FirstOrDefaultAsync(
            d => d.Id == request.DeckId,
            q => q.Include(d => d.Flashcards),
            cancellationToken
        );

        if (deck is null)
        {
            throw new EntityNotFoundException("Deck", request.DeckId.ToString());
        }

        //Update deck properties
        deck.Name = request.Deck.Name;
        deck.Description = request.Deck.Description;
        deck.CategoryId = request.Deck.CategoryId;

        // Flashcards
        var incoming = request.Deck.FlashCards;
        var existing = deck.Flashcards;

        // Build lookup dictionary for fast matching
        var existingById = existing
        .Where(c => c.Id != Guid.Empty)
        .ToDictionary(c => c.Id);

        // Determine incoming IDs
        var incomingIds = incoming
        .Where(c => c.Id != null)
        .Select(c => c.Id!.Value)
        .ToHashSet();

        // Remove flashcards no longer present
        if (deck.Flashcards is List<FlashCard> flashcardList)
        {
            flashcardList.RemoveAll(c => !incomingIds.Contains(c.Id));
        }

        foreach (var dto in incoming)
        {
            if (dto.Id != null && existingById.TryGetValue(dto.Id.Value, out var match))
            {
                // Update only if changed (optional optimization)
                if (match.Question != dto.Question || match.Answer != dto.Answer)
                {
                    match.Question = dto.Question;
                    match.Answer = dto.Answer;
                }
            }
            else
            {
                // Add new flashcard
                existing.Add(new FlashCard
                {
                    Id = Guid.NewGuid(),
                    Question = dto.Question,
                    Answer = dto.Answer,
                    DeckId = deck.Id
                });
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
