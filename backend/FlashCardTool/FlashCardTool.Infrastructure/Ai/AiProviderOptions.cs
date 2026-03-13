namespace FlashCardTool.Infrastructure.Ai;

public sealed class AiProviderOptions
{
    public const string SectionName = "Ai";

    public string Provider { get; set; } = string.Empty;

    public string ApiKey { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int MaxInputCharacters { get; set; } = 20000;

    public int MaxGeneratedCards { get; set; } = 20;
}
