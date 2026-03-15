using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlashCardTool.Application.AiFlashCards;

public record GenerateFlashcardsCommand(
    Guid? DeckId,
    AiContentSource Source,
    string? Instructions,
    int? TargetCardCount
) : IRequest<GenerateFlashcardsResponse>;

public sealed record GenerateFlashcardsResponse(
    IReadOnlyList<GeneratedFlashCardDto> FlashCards,
    IReadOnlyList<string> Warnings,
    string SourceSummary
);

public sealed class GenerateFlashcardsCommandHandler
    : IRequestHandler<GenerateFlashcardsCommand, GenerateFlashcardsResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly ICurrentUserService currentUserService;
    private readonly IContentExtractionService contentExtractionService;
    private readonly IAiFlashcardGenerationService aiFlashcardGenerationService;

    public GenerateFlashcardsCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IContentExtractionService contentExtractionService,
        IAiFlashcardGenerationService aiFlashcardGenerationService)
    {
        this.unitOfWork = unitOfWork;
        this.currentUserService = currentUserService;
        this.contentExtractionService = contentExtractionService;
        this.aiFlashcardGenerationService = aiFlashcardGenerationService;
    }

    public async Task<GenerateFlashcardsResponse> Handle(
        GenerateFlashcardsCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId
            ?? throw new InvalidOperationException("Current user identifier is required.");

        if (request.DeckId.HasValue)
        {
            var deck = await unitOfWork.Repository<Deck>().FirstOrDefaultAsync(
                d => d.Id == request.DeckId.Value,
                query => query.Include(d => d.Category),
                cancellationToken);

            if (deck is null)
            {
                throw new EntityNotFoundException("Deck", request.DeckId.Value.ToString());
            }

            if (deck.Category is null || deck.Category.UserId != userId)
            {
                throw new InvalidOperationException("Cannot generate flashcards for a deck that does not belong to the current user.");
            }
        }

        var extracted = await contentExtractionService.ExtractAsync(request.Source, cancellationToken);

        if (string.IsNullOrWhiteSpace(extracted.Text))
        {
            throw new InvalidOperationException("No readable content was found in the provided source.");
        }

        var generated = await aiFlashcardGenerationService.GenerateAsync(
            new AiGenerationInput(
                extracted.Text,
                request.Instructions,
                request.TargetCardCount,
                extracted.SourceType
            ),
            cancellationToken
        );

        return new GenerateFlashcardsResponse(
            generated,
            extracted.Warnings,
            $"Generated from {extracted.SourceType.ToString().ToLowerInvariant()} input"
        );
    }
}

