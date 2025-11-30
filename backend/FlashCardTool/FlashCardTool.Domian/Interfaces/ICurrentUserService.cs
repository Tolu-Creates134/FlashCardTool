using System;

namespace FlashCardTool.Domain.Interfaces;

/// <summary>
/// Represents current logged in user
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? Name { get; }
    string? PictureUrl { get; }
}
