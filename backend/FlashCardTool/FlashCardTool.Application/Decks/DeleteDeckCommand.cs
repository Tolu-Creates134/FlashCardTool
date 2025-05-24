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

    public DeleteDeckCommandHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteDeckCommand request, CancellationToken cancellationToken)
    {
        var repo = unitOfWork.Repository<Deck>();
        var deck = await repo.GetByIdAsync(request.Id, cancellationToken);

        if (deck is null)
        {
            throw new EntityNotFoundException(nameof(Deck), request.Id);
        }

        repo.Remove(deck);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}