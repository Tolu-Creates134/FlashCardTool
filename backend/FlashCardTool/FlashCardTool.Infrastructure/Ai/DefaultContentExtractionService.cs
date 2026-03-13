using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;

namespace FlashCardTool.Infrastructure.Ai;

public sealed class DefaultContentExtractionService : IContentExtractionService
{
    public Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (source.SourceType == AiSourceType.Text)
        {
            return Task.FromResult(new ExtractedContentResult(
                source.Text?.Trim() ?? string.Empty,
                AiSourceType.Text,
                Array.Empty<string>()));
        }

        throw new NotSupportedException("File extraction is not implemented yet.");
    }
}
