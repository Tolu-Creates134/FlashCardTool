using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Categories;

public record ListAllCategoriesQuery : IRequest<ListAllCategoriesResponse>;

public record ListAllCategoriesResponse(List<CategoryDto> Categories);

public class ListAllCategoriesQueryHandler : IRequestHandler<ListAllCategoriesQuery, ListAllCategoriesResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;

    public ListAllCategoriesQueryHandler(
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

    public async Task<ListAllCategoriesResponse> Handle(ListAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identifier is required.");

        if (userId == Guid.Empty)
        {
            throw new InvalidOperationException("Current user identifier is required.");
        }

        var categories = await unitOfWork
        .Repository<Category>()
        .FindAsync(c => c.UserId == userId, cancellationToken);

        var categoryDtos = mapper.Map<List<CategoryDto>>(categories);

        return new ListAllCategoriesResponse(categoryDtos);
    }
}
