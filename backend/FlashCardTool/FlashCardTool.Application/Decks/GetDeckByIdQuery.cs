using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.Decks;

public record GetDeckByIdQuery(Guid DeckId) : IRequest<GetDeckByIdResponse>;

public record GetDeckByIdResponse(DeckDto Deck);

public class GetDeckByIdQueryHandler : IRequestHandler<GetDeckByIdQuery, GetDeckByIdResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;

    public GetDeckByIdQueryHandler(
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

    public async Task<GetDeckByIdResponse> Handle(GetDeckByIdQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        var deck = await unitOfWork
            .Repository<Deck>()
            .FirstOrDefaultAsync(
                d => d.Id == request.DeckId,
                query => query
                    .Include(d => d.Category)
                    .Include(d => d.Flashcards),
                cancellationToken);

        if (deck is null)
        {
            throw new EntityNotFoundException("Deck", request.DeckId.ToString());
        }

        if (deck.Category is null || deck.Category.UserId != userId)
        {
            throw new InvalidOperationException("Cannot access a deck that does not belong to the current user.");
        }

        var deckDto = mapper.Map<DeckDto>(deck);
        return new GetDeckByIdResponse(deckDto);
    }
}
