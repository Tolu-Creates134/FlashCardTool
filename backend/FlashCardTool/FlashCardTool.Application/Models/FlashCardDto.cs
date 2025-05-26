namespace FlashCardTool.Application.Models;

public record class FlashCardDto
(
    Guid? Id,
    string Question,
    string Answer
);
