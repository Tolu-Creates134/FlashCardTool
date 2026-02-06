
namespace FlashCardTool.Application.Models;

public record DeckDto
(
    string Name,
    string Description,
    Guid CategoryId,
    string? CategoryName,
    List<FlashCardDto> FlashCards
);
