using System;

namespace FlashCardTool.Domain.Entities;

public class FlashCard
{
    public Guid Id { get; set; } // Primary Key
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int DeckId { get; set; } // Foreign key to Deck
    public Deck Deck { get; set; } = null!;
}
