using FlashCardTool.Application.PractiseSessions;
using FlashCardTool.Application.Tests.Common;
using FlashCardTool.Domain.Entities;
using Xunit;
using DomainCategory = FlashCardTool.Domain.Entities.Category;
using DomainDeck = FlashCardTool.Domain.Entities.Deck;
using DomainPractiseSession = FlashCardTool.Domain.Entities.PractiseSession;

namespace FlashCardTool.Application.Tests.PractiseSessions;

public class CreatePractiseSessionCommandTests
{
    [Fact]
    public async Task Handle_calculates_accuracy_and_persists_session()
    {
        var userId = Guid.NewGuid();
        var category = new DomainCategory
        {
            Name = "History",
            UserId = userId
        };
        var deck = new DomainDeck
        {
            Name = "World Wars",
            Description = "Major events",
            CategoryId = category.Id,
            Category = category
        };

        var deckRepository = new InMemoryRepository<DomainDeck>();
        deckRepository.Seed(deck);

        var sessionRepository = new InMemoryRepository<DomainPractiseSession>();
        var unitOfWork = new FakeUnitOfWork()
            .WithRepository(deckRepository)
            .WithRepository(sessionRepository);
        var currentUser = new FakeCurrentUserService(userId, "owner@example.com", "Owner Name");
        var handler = new CreatePractiseSessionCommandHandler(unitOfWork, TestInfrastructure.Mapper, currentUser);

        var result = await handler.Handle(
            new CreatePractiseSessionCommand(deck.Id, 8, 10, 95, "{\"score\":8}"),
            CancellationToken.None);

        var persisted = Assert.Single(sessionRepository.Items);
        Assert.Equal(userId, persisted.UserId);
        Assert.Equal(deck.Id, persisted.DeckId);
        Assert.Equal(0.8d, persisted.Accuracy, 5);
        Assert.Equal(1, unitOfWork.SaveChangesCalls);
        Assert.Equal(0.8d, result.session.Accuracy, 5);
    }
}
