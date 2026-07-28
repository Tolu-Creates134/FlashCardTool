using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class User : BaseEntity
{
    public required string Email { get; init; }
    public string? Name { get; init; }
    public string? PictureUrl { get; init; }
    public string? RefreshToken { get; set; }
    public DateTime RefreshTokenExpiry { get; set; }
    public ICollection<Category> Categories { get; set; } = new List<Category>();
}
