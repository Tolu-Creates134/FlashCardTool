using System;
using System.ComponentModel.DataAnnotations;
using System.Text;
using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;
using UglyToad.PdfPig;

namespace FlashCardTool.Infrastructure.Ai;

public sealed class PdfContentExtractor : IContentExtractor
{
    private const int MaxCharacters = 40_000;

    public AiSourceType SourceType => AiSourceType.Pdf;

    public async Task<ExtractedContentResult> ExtractAsync(
        AiContentSource source,
        CancellationToken cancellationToken = default
    )
    {
        ArgumentNullException.ThrowIfNull(source);

        if (source.FileStream is null)
        {
            throw new ValidationException("A PDF file is required");
        }

        if (!string.Equals(source.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("The uploaded file must be a PDF.");
        }

        if (source.FileStream.CanSeek)
        {
            source.FileStream.Position = 0;
        }

        using var buffer = new MemoryStream();
        await source.FileStream.CopyToAsync(buffer, cancellationToken);
        buffer.Position = 0;

        var warnings = new List<string>();
        var builder = new StringBuilder();

        using var document = PdfDocument.Open(buffer);

        foreach(var page in document.GetPages())
        {
            cancellationToken.ThrowIfCancellationRequested();

            var pageText = page.Text?.Trim();

            if (string.IsNullOrWhiteSpace(pageText))
            {
                warnings.Add($"Page {page.Number} did not contain extract");
                continue;
            }

            builder.AppendLine(pageText);
            builder.AppendLine();

            if (builder.Length >= MaxCharacters)
            {
                warnings.Add($"PDF content was truncated {MaxCharacters} characters before AI generation.");
                break;
            }
        }

        var extractedText = builder.ToString().Trim();

        if (builder.Length > MaxCharacters)
        {
            extractedText = extractedText[..MaxCharacters];
        }

        if (string.IsNullOrWhiteSpace(extractedText))
        {
            throw new ValidationException(
                "No readable text was found in the PDF. It may be a scanned PDF and require OCR."
            );
        }

        return new ExtractedContentResult(
            extractedText,
            SourceType,
            warnings
        );
    }



}
