using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Models;
using FlashCardTool.Application.Tests.Common;
using Xunit;
using DomainCategory = FlashCardTool.Domain.Entities.Category;
using DomainDeck = FlashCardTool.Domain.Entities.Deck;

namespace FlashCardTool.Application.Tests.Deck;

public class CreateDeckCommandTests
{
    [Fact]
    public async Task Handle_persists_deck_and_assigns_flashcards_to_new_deck()
    {
        var userId = Guid.NewGuid();
        var category = new DomainCategory
        {
            Name = "Languages",
            UserId = userId
        };

        var categoryRepository = new InMemoryRepository<DomainCategory>();
        categoryRepository.Seed(category);

        var deckRepository = new InMemoryRepository<DomainDeck>();
        var unitOfWork = new FakeUnitOfWork()
            .WithRepository(categoryRepository)
            .WithRepository(deckRepository);
        var currentUser = new FakeCurrentUserService(userId, "owner@example.com", "Owner Name");
        var handler = new CreateDeckCommandHandler(unitOfWork, TestInfrastructure.Mapper, currentUser);

        var request = new DeckDto(
            "Spanish Basics",
            "Core starter deck",
            category.Id,
            null,
            new List<FlashCardDto>
            {
                new(null, "Hola", "Hello"),
                new(null, "Adios", "Goodbye")
            });

        var result = await handler.Handle(new CreateDeckCommand(request), CancellationToken.None);

        var persisted = Assert.Single(deckRepository.Items);
        Assert.Equal(category.Id, persisted.CategoryId);
        Assert.All(persisted.Flashcards, flashcard => Assert.Equal(persisted.Id, flashcard.DeckId));
        Assert.Equal(1, unitOfWork.SaveChangesCalls);
        Assert.Equal(persisted.Id, result.Id);
        Assert.Equal(2, result.Deck.FlashCards.Count);
    }
}
