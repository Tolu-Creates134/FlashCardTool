
namespace FlashCardTool.Application.Models;

public record DeckDto
(
    string? Name,
    string? Description,
    Guid CategoryId,
    List<FlashCardDto> FlashCards
);
