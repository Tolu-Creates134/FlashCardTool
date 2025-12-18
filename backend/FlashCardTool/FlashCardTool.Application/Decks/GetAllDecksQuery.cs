using System;
using System.Collections.Generic;
using System.Linq;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Decks;

public record GetAllDecksQuery() : IRequest<GetAllDecksResponse>;

public record GetAllDecksResponse(IEnumerable<DeckListItemDto> Decks);

public class GetAllDecksQueryHandler : IRequestHandler<GetAllDecksQuery, GetAllDecksResponse>
{
    private readonly IUnitOfWork unitOfWork;

    private readonly ICurrentUserService currentUserService;

    public GetAllDecksQueryHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(currentUserService);

        this.unitOfWork = unitOfWork;
        this.currentUserService = currentUserService;
    }

    public async Task<GetAllDecksResponse> Handle(GetAllDecksQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        var categoryRepo = unitOfWork.Repository<Category>();
        var userCategories = (await categoryRepo
        .FindAsync(c => c.UserId == userId, cancellationToken))
        .ToList();

        if (userCategories.Count == 0)
        {
            return new GetAllDecksResponse(Array.Empty<DeckListItemDto>());
        }

        var categoryLookup = userCategories.ToDictionary(c => c.Id);
        var allowedCategoryIds = categoryLookup.Keys.ToList();

        var decks = await unitOfWork
        .Repository<Deck>()
        .FindAsync(d => allowedCategoryIds.Contains(d.CategoryId), cancellationToken);

        var deckDtos = decks
        .Select(deck =>
        {
            var category = categoryLookup[deck.CategoryId];
            return new DeckListItemDto(deck.Id, deck.Name, deck.Description, category.Name);
        })
        .ToList();

        return new GetAllDecksResponse(deckDtos);
    }
}
