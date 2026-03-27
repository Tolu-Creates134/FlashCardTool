using System.Runtime.CompilerServices;
using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;

namespace FlashCardTool.Infrastructure.Ai;

public sealed class DefaultContentExtractionService : IContentExtractionService
{
    public async Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(source);

        return source.SourceType switch
        {
            AiSourceType.Text => new ExtractedContentResult(
                source.Text?.Trim() ?? string.Empty,
                AiSourceType.Text,
                Array.Empty<string>()
            ),

            AiSourceType.Pdf => throw new NotSupportedException(
                "PDF extraction is not implemented yet."
            ),

            AiSourceType.Image => throw new NotSupportedException(
                "Image extraction is not implemented yet."
            ),

            _ => throw new InvalidOperationException("Unsupported AI content source.")
        };
    }
}
