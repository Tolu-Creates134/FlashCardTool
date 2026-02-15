using System;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Decks;

public record DeleteDeckCommand (Guid Id) : IRequest;

public class DeleteDeckCommandHandler : IRequestHandler<DeleteDeckCommand>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly ICurrentUserService currentUserService;

    public DeleteDeckCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(currentUserService);

        this.unitOfWork = unitOfWork;
        this.currentUserService = currentUserService;
    }

    public async Task Handle(DeleteDeckCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");
    
        var deckRepository = unitOfWork.Repository<Deck>();
        var deck = await deckRepository.GetByIdAsync(request.Id, cancellationToken);

        if (deck is null)
        {
            throw new EntityNotFoundException(nameof(Deck), request.Id.ToString());
        }

        deckRepository.Remove(deck);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}