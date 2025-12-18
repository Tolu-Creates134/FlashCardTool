using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Decks;

public record CreateDeckCommand(DeckDto Deck) : IRequest<CreateDeckResponse>;

public record CreateDeckResponse(DeckDto Deck, Guid Id);

public class CreateDeckCommandHandler: IRequestHandler<CreateDeckCommand, CreateDeckResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;

    public CreateDeckCommandHandler(
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

    public async Task<CreateDeckResponse> Handle(CreateDeckCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(request.Deck);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        var categoryRepo = unitOfWork.Repository<Category>();

        var category = await categoryRepo.FirstOrDefaultAsync(
            c => c.Id == request.Deck.CategoryId,
            cancellationToken
        );

        if (category is null)
        {
            throw new EntityNotFoundException("Category", request.Deck.CategoryId.ToString());
        }

        if (category.UserId != userId)
        {
            throw new InvalidOperationException("Cannot create a deck in a category that does not belong to the current user.");
        }

        var deck = mapper.Map<Deck>(request.Deck);
        deck.CategoryId = category.Id;

        if (deck.Flashcards is not null)
        {
            foreach (var flashCard in deck.Flashcards)
            {
                flashCard.DeckId = deck.Id;
            }
        }

        var created = await unitOfWork.Repository<Deck>().AddAsync(deck, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateDeckResponse(mapper.Map<DeckDto>(created), created.Id);    
    }
}
