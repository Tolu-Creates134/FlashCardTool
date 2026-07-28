using System;

namespace FlashCardTool.Domain.Core;

public abstract class BaseEntity
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public DateTime Timestamp { get; private set; }
}
