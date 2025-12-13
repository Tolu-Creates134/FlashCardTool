using System;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using FlashCardTool.Infrastructure.Auth;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace FlashCardTool.Application.Users;

public record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenCommandResponse>;

public record RefreshTokenCommandResponse (string AccessToken, string RefreshToken);

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenCommandResponse>
{
    private readonly IUnitOfWork unitOfWork;

    private readonly IConfiguration configuration;

    public RefreshTokenCommandHandler ( IUnitOfWork unitOfWork, IConfiguration configuration )
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(configuration);

        this.unitOfWork = unitOfWork;
        this.configuration = configuration;
    }

    public async Task<RefreshTokenCommandResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var userRepository = unitOfWork.UserRepository();

        var user = await userRepository.GetByRefreshTokenAsync(request.RefreshToken);

        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token");
        }

        // Generate new tokens
        var newAccessToken = JwtHelper.GenerateJwtToken(
            user!.Id,
            user.Email,
            user?.Name,
            user?.PictureUrl,
            configuration,
            15 // minutes
        );

        var newRefreshToken = JwtHelper.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(30);

        await unitOfWork.Repository<User>().UpdateAsync(user);

        return new RefreshTokenCommandResponse(newAccessToken, newRefreshToken);
    }
}