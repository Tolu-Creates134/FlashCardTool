using System;
using FlashCardTool.Application.Common.Enums;

namespace FlashCardTool.Application.Models;

/// <summary>
/// 
/// </summary>
/// <param name="SourceType"></param>
/// <param name="Text"></param>
/// <param name="FileName"></param>
/// <param name="ContentType"></param>
/// <param name="FileStream"></param>
public record AiContentSource(
    AiSourceType SourceType,
    string? Text,
    string? FileName,
    string? ContentType,
    Stream? FileStream
);

