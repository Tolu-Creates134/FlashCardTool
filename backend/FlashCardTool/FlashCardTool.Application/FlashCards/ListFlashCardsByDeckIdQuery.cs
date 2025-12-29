using System;
using System.Collections.Generic;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.FlashCards;

public record ListFlashCardsByDeckIdQuery(Guid DeckId) : IRequest<ListFlashCardsByDeckIdResponse>;

public record ListFlashCardsByDeckIdResponse(FlashCardDto[] FlashCards);

public class ListFlashCardsByDeckIdQueryHandler : IRequestHandler<ListFlashCardsByDeckIdQuery, ListFlashCardsByDeckIdResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;

    public ListFlashCardsByDeckIdQueryHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(mapper);
        ArgumentNullException.ThrowIfNull(currentUserService);

        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    public async Task<ListFlashCardsByDeckIdResponse> Handle(ListFlashCardsByDeckIdQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        var deck = await unitOfWork
        .Repository<Deck>()
        .FirstOrDefaultAsync(
            d => d.Id == request.DeckId,
            query => query.Include(d => d.Category),
            cancellationToken
        );

        if (deck is null)
        {
            throw new EntityNotFoundException("Deck", request.DeckId.ToString());
        }

        if (deck.Category is null || deck.Category.UserId != userId)
        {
            throw new InvalidOperationException("Cannot access flashcards for a deck that does not belong to the current user.");
        }

        var flashCards = await unitOfWork
        .Repository<FlashCard>()
        .FindAsync(fc => fc.DeckId == deck.Id, cancellationToken);

        var flashCardDtos = mapper.Map<List<FlashCardDto>>(flashCards);

        return new ListFlashCardsByDeckIdResponse(flashCardDtos.ToArray());
    }
}
