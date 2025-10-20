using System;
using AutoMapper;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Users;

public record SaveUserCommand
(
    string? Name,
    string Email,
    string PicturUrl
) : IRequest<SaveUserCommandResponse>;

public record SaveUserCommandResponse (Guid Id);

public class SaveUserCommandHandler : IRequestHandler<SaveUserCommand, SaveUserCommandResponse>
{
    private readonly IUnitOfWork UnitOfWork;

    private readonly IMapper Mapper;

    private readonly IUserRepository UserRepository;

    public SaveUserCommandHandler(IUnitOfWork UnitOfWork, IMapper Mapper, IUserRepository UserRepository)
    {
        this.UnitOfWork = UnitOfWork;
        this.Mapper = Mapper;
        this.UserRepository = UserRepository;
    }

    public async Task<SaveUserCommandResponse> Handle(SaveUserCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(UnitOfWork);
        ArgumentNullException.ThrowIfNull(Mapper);
        ArgumentNullException.ThrowIfNull(UserRepository);

        var existingUser = await UserRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (existingUser != null)
        {
            return new SaveUserCommandResponse(existingUser.Id);
        }

        var newUser = Mapper.Map<User>(request);

        await UnitOfWork.Repository<User>().AddAsync(newUser);

        await UnitOfWork.SaveChangesAsync(cancellationToken);

        return new SaveUserCommandResponse(newUser.Id);
    }
}




