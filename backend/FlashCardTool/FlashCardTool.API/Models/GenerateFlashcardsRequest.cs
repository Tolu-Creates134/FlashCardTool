namespace FlashCardTool.API.Models;

public sealed class GenerateFlashcardsRequest
{
    public string? Text { get; set; }

    public IFormFile? File { get; set; }

    public string? Instructions { get; set; }

    public int? TargetCardCount { get; set; }
}
