using System;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;

namespace FlashCardTool.Application.AiFlashCards;

public interface IContentExtractor
{
    AiSourceType SourceType { get; }

    Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source, 
        CancellationToken cancellationToken
    );
}
