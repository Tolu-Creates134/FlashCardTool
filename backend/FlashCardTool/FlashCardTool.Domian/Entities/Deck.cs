using System;

namespace FlashCardTool.Domain.Entities;

public class Deck
{
    public Guid Id { get; set; } // Primary key 
    public string Name { get; set; } = string.Empty;
    public ICollection<FlashCard> Flashcards { get; set; } = new List<FlashCard>();
    
    // Foreign key to Category
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
