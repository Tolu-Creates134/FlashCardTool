using System;
using FlashCardTool.Application.Common.Enums;

namespace FlashCardTool.Application.Models;

public record AiGenerationInput(
    string SourceText,
    string? Instructions,
    int? TargetCardCount,
    AiSourceType SourceType
);
