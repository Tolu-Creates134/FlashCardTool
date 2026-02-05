using System;
using FlashCardTool.Domain.Core;

namespace FlashCardTool.Domain.Entities;

public class PractiseSession : BaseEntity 
{
    public Guid UserId { get; set; }
    public Guid DeckId { get; set; }
    public int CorrectCount { get; set; }
    public int TotalCount { get; set; }
    public double Accuracy { get; set; }
    public int CompletionTime { get; set; }
    public string? ResponseJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public Deck Deck { get; set; } = null!;
}
