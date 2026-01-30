namespace FlashCardTool.Application.Models;

public record CreatePractiseSessionRequest (
    int CorrectCount,
    int TotalCount,
    string? ResponseJson
);