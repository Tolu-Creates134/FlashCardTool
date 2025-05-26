using System.Linq.Expressions;
using FlashCardTool.Domain.Core;
using Microsoft.EntityFrameworkCore.Query;

namespace FlashCardTool.Domain.Interfaces;

public interface IGenericRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default
    );

    Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IIncludableQueryable<T, object>> include,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<T>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<T>> FindAsync(
        Expression<Func<T, bool>> predicate,
        CancellationToken cancellationToken = default
    );

    Task<T> AddAsync(
        T entity,
        CancellationToken cancellationToken = default
    );

    Task<T> UpdateAsync(
        T entity,
        CancellationToken cancellationToken = default
    );

    void Remove(
        T entity
    );
}
