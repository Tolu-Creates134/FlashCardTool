using System;
using AutoMapper;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using FlashCardTool.Infrastructure.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace FlashCardTool.Application.Users;

public record SaveUserCommand
(
    string? Name,
    string Email,
    string PicturUrl
) : IRequest<SaveUserCommandResponse>;

public record SaveUserCommandResponse (Guid Id, string refreshToken);

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
            existingUser.RefreshToken = JwtHelper.GenerateRefreshToken();
            existingUser.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
            existingUser._Timestamp = DateTime.UtcNow;

            await UnitOfWork.Repository<User>().UpdateAsync(existingUser, cancellationToken);
            await UnitOfWork.SaveChangesAsync(cancellationToken);

            return new SaveUserCommandResponse(existingUser.Id, existingUser.RefreshToken);
        }

        var newUser = Mapper.Map<User>(request);
        newUser.RefreshToken = JwtHelper.GenerateRefreshToken();
        newUser.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
        newUser._Timestamp = DateTime.UtcNow;

        await UnitOfWork.Repository<User>().AddAsync(newUser, cancellationToken);
        await UnitOfWork.SaveChangesAsync(cancellationToken);

        return new SaveUserCommandResponse(newUser.Id, newUser.RefreshToken);
    }
}


