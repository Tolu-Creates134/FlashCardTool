using System;
using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;

namespace FlashCardTool.Infrastructure.Ai;

public sealed class TextContentExtractor : IContentExtractor
{
    public AiSourceType SourceType => AiSourceType.Text;

    public Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source,
        CancellationToken cancellationToken = default
    )
    {
        ArgumentNullException.ThrowIfNull(source);

        var text = source.Text?.Trim() ?? string.Empty;

        return Task.FromResult(new ExtractedContentResult(
            text,
            AiSourceType.Text,
            Array.Empty<string>()
        ));
    }
}
