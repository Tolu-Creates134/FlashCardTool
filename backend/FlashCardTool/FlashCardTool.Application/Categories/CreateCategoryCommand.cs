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
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;

    public CreateCategoryCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
    }

    public async Task<CreateCategoryResponse> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = mapper.Map<Category>(request.Category);

        var created = await unitOfWork.Repository<Category>().AddAsync(category, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateCategoryResponse(mapper.Map<CategoryDto>(created), created.Id);
    }
}