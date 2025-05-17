using System;
using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Interfaces;


/// <summary>
/// Unit of work, which is a design pattern that groups all database operations into a single transaction
/// </summary>
public interface IUnitOfWork
{
    IGenericRepository<T> Repository<T>() where T : BaseEntity;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
