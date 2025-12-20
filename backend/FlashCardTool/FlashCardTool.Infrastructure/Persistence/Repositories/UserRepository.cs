using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DataHubContext context;

    public UserRepository(DataHubContext context)
    {
        this.context = context;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken)
    {
        return await context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
    }
}
