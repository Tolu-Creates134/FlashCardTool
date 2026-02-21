using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Users;

public record GetCurrentUserQuery : IRequest<GetCurrentUserQueryResponse>;

public record GetCurrentUserQueryResponse(
    Guid Id, 
    string Email,
    string? Name
);

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, GetCurrentUserQueryResponse>
{
    public readonly IUnitOfWork unitOfWork;
    private readonly ICurrentUserService currentUserService;

    public GetCurrentUserQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(currentUserService);

        this.unitOfWork = unitOfWork;
        this.currentUserService = currentUserService;
    }

    public async Task<GetCurrentUserQueryResponse> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("Current user identified is required");

        var user =  await unitOfWork.Repository<User>().GetByIdAsync(userId, cancellationToken);

        if (user is null)
        {
            throw new EntityNotFoundException("User", userId.ToString());
        }

        return new GetCurrentUserQueryResponse(
            user.Id,
            user.Email,
            user.Name
        );
    }
}


