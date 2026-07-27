using System;
using AutoMapper;
using FlashCardTool.Application.Common.Interfaces;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;

using MediatR;

namespace FlashCardTool.Application.Decks;

public record CreateDeckCommand(DeckDto Deck) : IRequest<CreateDeckResponse>;

public record CreateDeckResponse(DeckDto Deck, Guid Id);

public class CreateDeckCommandHandler: IRequestHandler<CreateDeckCommand, CreateDeckResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;
    private readonly ICurrentUserService currentUserService;
    private readonly IRichTextSanitizerService richTextSanitizerService;

    public CreateDeckCommandHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUserService,
        IRichTextSanitizerService richTextSanitizerService)
    {
        ArgumentNullException.ThrowIfNull(unitOfWork);
        ArgumentNullException.ThrowIfNull(mapper);
        ArgumentNullException.ThrowIfNull(currentUserService);
        ArgumentNullException.ThrowIfNull(richTextSanitizerService);

        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
        this.richTextSanitizerService = richTextSanitizerService;
    }

    public async Task<CreateDeckResponse> Handle(CreateDeckCommand request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(request.Deck);

        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException("Current user identifier is required.");

        var categoryRepo = unitOfWork.Repository<Category>();

        var category = await categoryRepo.FirstOrDefaultAsync(
            c => c.Id == request.Deck.CategoryId,
            cancellationToken
        );

        if (category is null)
        {
            throw new EntityNotFoundException("Category", request.Deck.CategoryId.ToString());
        }

        if (category.UserId != userId)
        {
            throw new ForbiddenOperationException("Cannot create a deck in a category that does not belong to the current user.");
        }

        var deck = mapper.Map<Deck>(request.Deck);
        deck.CategoryId = category.Id;

        if (deck.Flashcards is not null)
        {
            foreach (var flashCard in deck.Flashcards)
            {
                flashCard.DeckId = deck.Id;
                flashCard.Question = richTextSanitizerService.SanitizeFlashCardHtml(flashCard.Question);
                flashCard.Answer = richTextSanitizerService.SanitizeFlashCardHtml(flashCard.Answer);

                // Validate after sanitisation — not before
                if (!richTextSanitizerService.HasMeaningfulContent(flashCard.Question))
                {
                    throw new ValidationException("Flashcard question cannot be empty or contain only invalid content.");
                }

                if (!richTextSanitizerService.HasMeaningfulContent(flashCard.Answer))
                {
                    throw new ValidationException("Flashcard answer cannot be empty or contain only invalid content.");
                }
            }
        }

        var created = await unitOfWork.Repository<Deck>().AddAsync(deck, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateDeckResponse(mapper.Map<DeckDto>(created), created.Id);    
    }
}
