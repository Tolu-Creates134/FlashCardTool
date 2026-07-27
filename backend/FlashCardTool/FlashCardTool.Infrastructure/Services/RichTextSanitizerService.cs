using System.Net;
using System.Text.RegularExpressions;
using FlashCardTool.Application.Common.Interfaces;
using Ganss.Xss;
public sealed class RichTextSanitizerService : IRichTextSanitizerService
{
    private readonly HtmlSanitizer _sanitizer;
    public RichTextSanitizerService()
    {
        _sanitizer = new HtmlSanitizer();

        _sanitizer.AllowedTags.Clear();
        _sanitizer.AllowedTags.UnionWith(new[]
        {
            "p", "br", "strong", "em", "ul", "ol", "li", "code", "pre"
        });

        _sanitizer.AllowedAttributes.Clear();
        _sanitizer.AllowedAttributes.UnionWith(new[]
        {
            "class"
        });

        _sanitizer.AllowedCssProperties.Clear();
        _sanitizer.AllowedSchemes.Clear();
    }

    public string SanitizeFlashCardHtml(string html)
    {
        return _sanitizer.Sanitize(html ?? string.Empty);
    }

    public bool HasMeaningfulContent(string sanitizedHtml)
    {
        if (string.IsNullOrWhiteSpace(sanitizedHtml))
        {
            return false;
        }

        var decoded = WebUtility.HtmlDecode(sanitizedHtml);

        var withoutTags = Regex.Replace(decoded, "<.*?>", string.Empty);

        var normalized = withoutTags
        .Replace('\u00A0', ' ')
        .Trim();

        return !string.IsNullOrWhiteSpace(normalized);
    }
}