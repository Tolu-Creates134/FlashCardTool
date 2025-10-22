using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class User : BaseEntity
{
    public required Guid UserKey { get; init; } = Guid.NewGuid();

    public required string Email { get; init; }

    public string? Name { get; init; }

    public string? PictureUrl { get; init; }

    public DateTime _Timestamp { get; init; } = DateTime.UtcNow;
}
