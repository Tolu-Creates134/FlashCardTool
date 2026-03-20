namespace FlashCardTool.Infrastructure.Ai;

public sealed class AiProviderOptions
{
    public const string SectionName = "Ai";
    public string Provider { get; set; } = "OpenAI";
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-4.1-mini";
    public string BaseUrl { get; set; } = "https://api.openai.com/v1/";
    public int MaxInputCharacters { get; set; } = 20000;
    public int MaxGeneratedCards { get; set; } = 20;
}
