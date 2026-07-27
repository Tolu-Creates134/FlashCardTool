namespace FlashCardTool.Application.Common.Interfaces;

public interface IRichTextSanitizerService
{
    string SanitizeFlashCardHtml( string html);

    bool HasMeaningfulContent(string sanitizedHtml);
}