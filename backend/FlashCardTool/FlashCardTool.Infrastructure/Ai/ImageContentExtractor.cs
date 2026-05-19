using System;
using System.ComponentModel.DataAnnotations;
using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;

namespace FlashCardTool.Infrastructure.Ai;

public class ImageContentExtractor : IContentExtractor
{
    private static readonly HashSet<string> SupportedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp"
    };

    private readonly IImageTextExtractionService imageTextExtractionService;

    public ImageContentExtractor(IImageTextExtractionService imageTextExtractionService)
    {
        ArgumentNullException.ThrowIfNull(imageTextExtractionService);

        this.imageTextExtractionService = imageTextExtractionService;
    }

    public AiSourceType SourceType => AiSourceType.Image;

    public async Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source,
        CancellationToken cancellationToken = default
    )
    {
        ArgumentNullException.ThrowIfNull(source);

        if (source.FileStream is null)
        {
            throw new ValidationException("An image file is reuiqred");
        }

        if (string.IsNullOrWhiteSpace(source.ContentType) || 
            !SupportedContentTypes.Contains(source.ContentType))
        {
            throw new ValidationException("The uploaded file must be a PNG, JPEG, JPG, or WebP image.");
        }

        if (source.FileStream.CanSeek)
        {
            source.FileStream.Position = 0;
        }

        var extractedText = await imageTextExtractionService.ExtractTextAsync(
            source.FileStream,
            source.ContentType,
            cancellationToken
        );

        if (string.IsNullOrWhiteSpace(extractedText))
        {
            throw new ValidationException("No readable text was found in the image");
        }

        return new ExtractedContentResult(
            extractedText.Trim(),
            AiSourceType.Image,
            Array.Empty<string>()
        );
    }
}
