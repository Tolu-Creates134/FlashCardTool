using System;

namespace FlashCardTool.Application.AiFlashCards;

public interface IImageTextExtractionService
{
    Task<string> ExtractTextAsync(
        Stream imageStream,
        string contentType,
        CancellationToken cancellationToken = default
    );
}
