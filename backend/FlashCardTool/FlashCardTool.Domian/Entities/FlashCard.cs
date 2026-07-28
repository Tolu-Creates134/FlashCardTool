using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class FlashCard : BaseEntity
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public Guid DeckId { get; set; } // Foreign key to Deck
    public Deck Deck { get; set; } = null!;
}
