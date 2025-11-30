using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Categories;

public record ListAllCategoriesQuery : IRequest<ListAllCategoriesResponse>;

public record ListAllCategoriesResponse (List<CategoryDto> Categories);

public class ListAllCategoriesQueryHandler : IRequestHandler<ListAllCategoriesQuery, ListAllCategoriesResponse>
{
    private readonly IUnitOfWork UnitOfWork;
    private readonly IMapper Mapper;

    public ListAllCategoriesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        UnitOfWork = unitOfWork;
        Mapper = mapper;
    }


    public async Task<ListAllCategoriesResponse> Handle(ListAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await UnitOfWork
        .Repository<Category>()
        .GetAllAsync(cancellationToken);

        return Mapper.Map<ListAllCategoriesResponse>(categories);
    }
}
