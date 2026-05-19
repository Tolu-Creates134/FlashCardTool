using System.Runtime.CompilerServices;
using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;

namespace FlashCardTool.Infrastructure.Ai;

public sealed class ContentExtractionService : IContentExtractionService
{
    private readonly IDictionary<AiSourceType, IContentExtractor> extractors;

    public ContentExtractionService(IEnumerable<IContentExtractor> extractors)
    {
        ArgumentNullException.ThrowIfNull(extractors);

        this.extractors = extractors.ToDictionary(x => x.SourceType);
    }

    public async Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(source);

        if (!extractors.TryGetValue(source.SourceType, out var extractor))
        {
            throw new InvalidOperationException(
                $"No extractor is registered for source type '{source.SourceType}'.");
        }

        return await extractor.ExtractAsync(source, cancellationToken);
    }
}
