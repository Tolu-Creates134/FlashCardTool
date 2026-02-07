namespace FlashCardTool.Application.Models;

public record class DeckSummaryDto
(
    Guid Id,
    string Name,
    string Description,
    string CategoryName,
    Guid CategoryId,
    int FlashCardCount
);