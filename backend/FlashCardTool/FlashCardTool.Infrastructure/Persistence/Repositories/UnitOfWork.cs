using System;
using System.Collections.Concurrent;
using FlashCardTool.Domain.Core;
using FlashCardTool.Domain.Interfaces;

namespace FlashCardTool.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    protected readonly DataHubContext context;

    public UnitOfWork(DataHubContext dataHubContext)
    {
        context = dataHubContext;
    }

    public IUserRepository UserRepository () => new UserRepository (context);

    public IGenericRepository<T> Repository<T> () where T : BaseEntity => new GenericRepository<T> (context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await context.SaveChangesAsync(cancellationToken);
    }
}
