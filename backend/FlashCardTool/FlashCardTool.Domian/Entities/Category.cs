using System;
using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class Category : BaseEntity
{
    public required string Name { get; set; }
    public DateTime CreatedAt { get; init; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public ICollection<Deck> Decks { get; set; } = new List<Deck>();
}