using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.PractiseSessions;

public record ListPractiseSessionsByDeckIdQuery (Guid DeckId, int? PageNumber, int? PageSize)
: IRequest<ListPractiseSessionsByDeckIdQueryResponse>;

public record ListPractiseSessionsByDeckIdQueryResponse (PractiseSessionDto[] sessions);

public class ListPractiseSessionsByDeckIdQueryHandler : IRequestHandler<ListPractiseSessionsByDeckIdQuery, ListPractiseSessionsByDeckIdQueryResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;
    
    public ListPractiseSessionsByDeckIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(mapper);
        ArgumentNullException.ThrowIfNull(currentUserService);

        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    public async Task<ListPractiseSessionsByDeckIdQueryResponse> Handle(ListPractiseSessionsByDeckIdQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required");

        var deckRepository = unitOfWork.Repository<Deck>();

        var deck = await deckRepository.FirstOrDefaultAsync(
            d => d.Id == request.DeckId,
            query => query.Include(d => d.Category),
            cancellationToken
        );

        if (deck == null)
        {
            throw new EntityNotFoundException("Deck", request.DeckId.ToString());
        }

        if (deck.Category is null || deck.Category.UserId != userId)
        {
            throw new InvalidOperationException("Cannot access practice sessions for a deck that does not belong to the current user.");
        }

        IQueryable<PractiseSession> sessionsQuery = unitOfWork
        .Repository<PractiseSession>()
        .Query()
        .Where(s => s.DeckId == request.DeckId && s.UserId == userId)
        .OrderByDescending(s => s.CreatedAt);

        if (request.PageNumber.HasValue && request.PageSize.HasValue)
        {                          
            var skip = (request.PageNumber.Value - 1) * request.PageSize.Value;
            sessionsQuery = sessionsQuery.Skip(skip).Take(request.PageSize.Value);
        }

        var sessions = await sessionsQuery.ToListAsync(cancellationToken);

        var dto = mapper.Map<PractiseSessionDto[]>(sessions);

        return new ListPractiseSessionsByDeckIdQueryResponse(dto);
    }
}