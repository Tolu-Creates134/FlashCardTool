using System;

namespace FlashCardTool.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<Deck> Decks { get; set; } = new List<Deck>();
}