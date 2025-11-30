using System;
using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; init; } = DateTime.Now;
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public ICollection<Deck> Decks { get; set; } = new List<Deck>();
}