using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Categories;

public record CreateCategoryCommand(CategoryDto Category) : IRequest<CreateCategoryResponse>;

public record CreateCategoryResponse(CategoryDto Category, Guid Id);

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CreateCategoryResponse>
{
    private readonly IUnitOfWork UnitOfWork;
    private readonly IMapper Mapper;

    public CreateCategoryCommandHandler(IUnitOfWork UnitOfWork, IMapper Mapper)
    {
        this.UnitOfWork = UnitOfWork;
        this.Mapper = Mapper;
    }

    public async Task<CreateCategoryResponse> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = Mapper.Map<Category>(request.Category);

        var created = await UnitOfWork.Repository<Category>().AddAsync(category, cancellationToken);
        await UnitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateCategoryResponse(Mapper.Map<CategoryDto>(created), created.Id);
    }
}