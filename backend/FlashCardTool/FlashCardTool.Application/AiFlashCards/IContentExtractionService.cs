using FlashCardTool.Application.Models;

namespace FlashCardTool.Application.AiFlashCards;

public interface IContentExtractionService
{
    Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source,
        CancellationToken cancellationToken = default
    );
}
