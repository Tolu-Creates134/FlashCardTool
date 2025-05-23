using System;
using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<Deck> Decks { get; set; } = new List<Deck>();
}