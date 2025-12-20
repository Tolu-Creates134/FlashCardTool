using System;
using FlashCardTool.Domain.Entities;

namespace FlashCardTool.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);

    Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken);
};
