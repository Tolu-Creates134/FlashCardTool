using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Models;
using Microsoft.Extensions.Options;

namespace FlashCardTool.Infrastructure.Ai;

public sealed class OpenAiFlashcardGenerationService : IAiFlashcardGenerationService
{
    private readonly AiProviderOptions options;

    public OpenAiFlashcardGenerationService(IOptions<AiProviderOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);

        this.options = options.Value;
    }

    public Task<IReadOnlyList<GeneratedFlashCardDto>> GenerateAsync(
        AiGenerationInput input,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(input);

        if (string.IsNullOrWhiteSpace(options.Model))
        {
            throw new InvalidOperationException("AI model configuration is missing.");
        }

        throw new NotImplementedException("AI provider integration has not been implemented yet.");
    }
}
