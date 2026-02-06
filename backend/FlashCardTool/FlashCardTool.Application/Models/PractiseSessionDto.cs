using System;

namespace FlashCardTool.Application.Models;

public record PractiseSessionDto
(
    Guid Id,
    Guid DeckId,
    int CorrectCount,
    int TotalCount,
    double Accuracy,
    string? ResponseJson,
    int CompletionTime,
    DateTime CreatedAt
);