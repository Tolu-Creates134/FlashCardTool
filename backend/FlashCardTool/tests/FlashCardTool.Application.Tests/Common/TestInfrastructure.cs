using System.Linq.Expressions;
using AutoMapper;
using FlashCardTool.Application.Common.Mappings;
using FlashCardTool.Domain.Core;
using FlashCardTool.Domain.Interfaces;
using Microsoft.EntityFrameworkCore.Query;

namespace FlashCardTool.Application.Tests.Common;

internal static class TestInfrastructure
{
    public static readonly IMapper Mapper = new MapperConfiguration(config =>
    {
        config.AddProfile<CategoryProfile>();
        config.AddProfile<DeckProfile>();
        config.AddProfile<PractiseSessionProfile>();
    }).CreateMapper();
}

internal sealed class FakeCurrentUserService(Guid? userId, string? email, string? name) : ICurrentUserService
{
    public Guid? UserId { get; } = userId;
    public string? Email { get; } = email;
    public string? Name { get; } = name;
    public string? PictureUrl => null;
}

internal sealed class FakeUnitOfWork : IUnitOfWork
{
    private readonly Dictionary<Type, object> repositories = new();

    public int SaveChangesCalls { get; private set; }

    public FakeUnitOfWork WithRepository<T>(InMemoryRepository<T> repository) where T : BaseEntity
    {
        repositories[typeof(T)] = repository;
        return this;
    }

    public IGenericRepository<T> Repository<T>() where T : BaseEntity
    {
        if (repositories.TryGetValue(typeof(T), out var repository))
        {
            return (IGenericRepository<T>)repository;
        }

        throw new InvalidOperationException($"Repository for {typeof(T).Name} has not been configured.");
    }

    public IUserRepository UserRepository()
    {
        throw new NotSupportedException();
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SaveChangesCalls++;
        return Task.FromResult(1);
    }
}

internal sealed class InMemoryRepository<T> : IGenericRepository<T> where T : BaseEntity
{
    public List<T> Items { get; } = new();

    public void Seed(T entity)
    {
        Items.Add(entity);
    }

    public Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Items.SingleOrDefault(entity => entity.Id == id));
    }

    public Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Items.AsQueryable().FirstOrDefault(predicate));
    }

    public Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IIncludableQueryable<T, object>> include,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Items.AsQueryable().FirstOrDefault(predicate));
    }

    public Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IEnumerable<T>>(Items);
    }

    public Task<IEnumerable<T>> FindAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IEnumerable<T>>(Items.AsQueryable().Where(predicate).ToList());
    }

    public Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        Items.Add(entity);
        return Task.FromResult(entity);
    }

    public Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(entity);
    }

    public void Remove(T entity)
    {
        Items.Remove(entity);
    }

    public IQueryable<T> Query()
    {
        return Items.AsQueryable();
    }
}
