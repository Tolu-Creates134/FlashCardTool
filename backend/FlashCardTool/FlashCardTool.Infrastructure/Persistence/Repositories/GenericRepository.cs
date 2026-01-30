using System;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using FlashCardTool.Domain.Core;
using FlashCardTool.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace FlashCardTool.Infrastructure.Persistence.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
{
    protected readonly DataHubContext context;
    protected readonly DbSet<T> dbSet;

    public GenericRepository(DataHubContext context)
    {
        this.context = context;
        dbSet = context.Set<T>(); // Returns the table for the entity type T
    }

    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        var entry = await
            dbSet
            .AddAsync(entity, cancellationToken);
        
        return entry.Entity;
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        var entry = await
            dbSet
            .Where(predicate)
            .ToListAsync(cancellationToken);

        return entry;
    }

    public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await dbSet.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public async Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IIncludableQueryable<T, object>> include,
        CancellationToken cancellationToken = default
    )
    {
        IQueryable<T> query = dbSet;

        query = include(query);

        return await query.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbSet.ToListAsync(cancellationToken);
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var record = await
            dbSet
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        return record;
    }

    public void Remove(T entity)
    {
        dbSet.Remove(entity);
    }

    public Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        var entry = dbSet.Update(entity);

        return Task.FromResult(entry.Entity);
    }

    public IQueryable<T> Query()
    {
        return dbSet;
    }
}
