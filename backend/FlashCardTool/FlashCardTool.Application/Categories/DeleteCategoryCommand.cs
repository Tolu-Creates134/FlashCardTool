using System;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Categories;


public record DeleteCategoryCommand (Guid CategoryId) : IRequest;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly ICurrentUserService currentUserService;
    public DeleteCategoryCommandHandler (IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(currentUserService);

        this.unitOfWork = unitOfWork;
        this.currentUserService = currentUserService;
    }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException("Current user identifier is required.");

        var categoryRepository = unitOfWork.Repository<Category>();

        var categoryToDelete= await categoryRepository.FirstOrDefaultAsync(
            c => c.Id == request.CategoryId,
            cancellationToken
        ) ?? throw new EntityNotFoundException("Category", request.CategoryId.ToString());

        if (userId != categoryToDelete?.UserId)
        {
            throw new ForbiddenOperationException("Cannot update a deck that does not belong to the current user.");
        }

        categoryRepository.Remove(categoryToDelete);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
