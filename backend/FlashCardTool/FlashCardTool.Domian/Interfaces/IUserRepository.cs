using System;
using FlashCardTool.Domain.Entities;

namespace FlashCardTool.Domain.Interfaces;

public interface IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
};
