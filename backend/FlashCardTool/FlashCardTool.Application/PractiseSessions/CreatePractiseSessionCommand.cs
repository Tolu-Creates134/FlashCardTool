using System;
using AutoMapper;
using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.PractiseSessions;

public record CreatePractiseSessionCommand (Guid DeckId, int CorrectCount, int TotalCount, string? ResponseJson)
: IRequest<CreatePractiseSessionResponse>;

public record CreatePractiseSessionResponse (PractiseSessionDto session);

public class CreatePractiseSessionCommandHandler : IRequestHandler<CreatePractiseSessionCommand, CreatePractiseSessionResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;

    public CreatePractiseSessionCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(mapper);
        ArgumentNullException.ThrowIfNull(currentUserService);

        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    public async Task<CreatePractiseSessionResponse> Handle(CreatePractiseSessionCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        if (request.CorrectCount < 0  || request.TotalCount < 0)
        {
            throw new InvalidOperationException("Counts must be non-negative");
        }

        if (request.CorrectCount > request.TotalCount)
        {
            throw new InvalidOperationException("Correct count cannot exceed total count");
        }

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
            throw new InvalidOperationException($"Cannot create practise session, deck does not belong to current user");
        }

        var totalCount = request.TotalCount;
        var correctCount = request.CorrectCount;
        var accuracy = totalCount == 0 ? 0d : (double)correctCount / totalCount;

        var session = new PractiseSession
        {
            UserId = userId,
            DeckId = deck.Id,
            CorrectCount = correctCount,
            TotalCount = totalCount,
            Accuracy = accuracy,
            ResponseJson = request.ResponseJson,
        };

        var created = await unitOfWork.Repository<PractiseSession>().AddAsync(session, cancellationToken);
        
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return mapper.Map<CreatePractiseSessionResponse>(created);
    }
}