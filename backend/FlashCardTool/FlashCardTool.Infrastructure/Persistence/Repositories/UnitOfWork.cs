using System;
using System.Collections.Concurrent;
using FlashCardTool.Domain.Core;
using FlashCardTool.Domain.Interfaces;

namespace FlashCardTool.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    protected readonly DataHubContext context;
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    public UnitOfWork(DataHubContext dataHubContext)
    {
        context = dataHubContext;
    }

    public IGenericRepository<T> Repository<T>() where T : BaseEntity
    {
        var type = typeof(T);

        if (!_repositories.ContainsKey(type))
        {
            var repo = new GenericRepository<T>(context);
            _repositories[type] = repo;
        }

        return (IGenericRepository<T>)_repositories[type]!;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await context.SaveChangesAsync(cancellationToken);
    }
}
