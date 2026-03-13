using FlashCardTool.Application.Common.Enums;

namespace FlashCardTool.Application.Models;

public record ExtractedContentResult(
    string Text,
    AiSourceType SourceType,
    IReadOnlyList<string> Warnings
);
