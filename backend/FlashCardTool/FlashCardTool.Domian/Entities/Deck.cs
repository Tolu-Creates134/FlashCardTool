using System;
using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class Deck : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public ICollection<FlashCard> Flashcards { get; set; } = [];
    
    // Foreign key to Category
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
