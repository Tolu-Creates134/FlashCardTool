using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.Decks;

public record ListAllDecksQuery : IRequest<ListAllDecksResponse>;

public record ListAllDecksResponse(DeckSummaryDto[] Decks);

public class ListAllDecksQueryHandler : IRequestHandler<ListAllDecksQuery, ListAllDecksResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;

    public ListAllDecksQueryHandler(
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

    public async Task<ListAllDecksResponse> Handle(ListAllDecksQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        var categoryRepo = unitOfWork.Repository<Category>();

        var userCategories = (await categoryRepo
        .FindAsync(c => c.UserId == userId, cancellationToken))
        .ToList();

        if (userCategories.Count == 0)
        {
            return new ListAllDecksResponse([]);
        }

        var categoryLookup = userCategories.ToDictionary(c => c.Id);
        var allowedCategoryIds = categoryLookup.Keys.ToList();

        var decks = await unitOfWork
        .Repository<Deck>()
        .Query()
        .Where(d => allowedCategoryIds.Contains(d.CategoryId))
        .Select(d => new DeckSummaryDto(
            d.Id,
            d.Name,
            d.Description,
            d.Category.Name,
            d.CategoryId,
            d.Flashcards.Count()
        ))
        .ToListAsync();

        return new ListAllDecksResponse(decks.ToArray());
    }
}
