using FlashCardTool.Application.Models;

namespace FlashCardTool.Application.AiFlashCards;

public interface IAiFlashcardGenerationService
{
    Task<IReadOnlyList<GeneratedFlashCardDto>> GenerateAsync(
        AiGenerationInput input,
        CancellationToken cancellationToken = default
    );
}
