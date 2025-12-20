namespace FlashCardTool.Application.Models;

public record class DeckListItemDto
(
    Guid Id,
    string Name,
    string Description,
    string CategoryName,
    string CategoryId
);