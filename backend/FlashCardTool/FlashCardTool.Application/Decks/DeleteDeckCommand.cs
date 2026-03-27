using System;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

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

        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException("Current user identifier is required.");

        var deckRepository = unitOfWork.Repository<Deck>();
        var categoryRepository = unitOfWork.Repository<Category>();

        var deck = await unitOfWork
        .Repository<Deck>()
        .FirstOrDefaultAsync(
            d => d.Id == request.Id,
            query => query
                .Include(d => d.Category)
                .ThenInclude(c => c!.Decks),
            cancellationToken
        );

        if (deck is null)
        {
            throw new EntityNotFoundException(nameof(Deck), request.Id.ToString());
        }

        if (deck.Category is null || deck.Category.UserId != userId)
        {
            throw new ForbiddenOperationException("Cannot delete a deck that does not belong to the current user.");
        }

        if (deck.Category.Decks.Count == 1)
        {
            categoryRepository.Remove(deck.Category);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return;
        }

        deckRepository.Remove(deck);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
