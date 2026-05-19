using FluentAssertions;
using FlashCardTool.Application.Decks;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using Moq;

namespace FlashCardTool.Application.Tests.Decks;

public class DeleteDeckCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IGenericRepository<Deck>> deckRepositoryMock;
    private readonly Mock<IGenericRepository<Category>> categoryRepositoryMock;
    private readonly DeleteDeckCommandHandler handler;

    public DeleteDeckCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        currentUserServiceMock = new Mock<ICurrentUserService>();
        deckRepositoryMock = new Mock<IGenericRepository<Deck>>();
        categoryRepositoryMock = new Mock<IGenericRepository<Category>>();

        unitOfWorkMock.Setup(x => x.Repository<Deck>()).Returns(deckRepositoryMock.Object);
        unitOfWorkMock.Setup(x => x.Repository<Category>()).Returns(categoryRepositoryMock.Object);

        handler = new DeleteDeckCommandHandler(unitOfWorkMock.Object, currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns((Guid?)null);

        var act = async () => await handler.Handle(new DeleteDeckCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Current user identifier is required.");
    }

    [Fact]
    public async Task Handle_ShouldThrowEntityNotFoundException_WhenDeckDoesNotExist()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Deck?)null);

        var act = async () => await handler.Handle(new DeleteDeckCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<EntityNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowForbiddenOperationException_WhenDeckBelongsToAnotherUser()
    {
        var currentUserId = Guid.NewGuid();

        currentUserServiceMock.Setup(x => x.UserId).Returns(currentUserId);
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildDeck(categoryUserId: Guid.NewGuid(), siblingDeckCount: 2));

        var act = async () => await handler.Handle(new DeleteDeckCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenOperationException>()
            .WithMessage("Cannot delete a deck that does not belong to the current user.");
    }

    [Fact]
    public async Task Handle_ShouldRemoveCategory_WhenDeckIsTheLastDeckInCategory()
    {
        var userId = Guid.NewGuid();
        var deck = BuildDeck(userId, siblingDeckCount: 1);

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(deck);

        await handler.Handle(new DeleteDeckCommand(deck.Id), CancellationToken.None);

        categoryRepositoryMock.Verify(x => x.Remove(deck.Category), Times.Once);
        deckRepositoryMock.Verify(x => x.Remove(It.IsAny<Deck>()), Times.Never);
        unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldRemoveDeck_WhenCategoryContainsOtherDecks()
    {
        var userId = Guid.NewGuid();
        var deck = BuildDeck(userId, siblingDeckCount: 2);

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(deck);

        await handler.Handle(new DeleteDeckCommand(deck.Id), CancellationToken.None);

        deckRepositoryMock.Verify(x => x.Remove(deck), Times.Once);
        categoryRepositoryMock.Verify(x => x.Remove(It.IsAny<Category>()), Times.Never);
        unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    private static Deck BuildDeck(Guid categoryUserId, int siblingDeckCount)
    {
        var category = new Category
        {
            Name = "Science",
            UserId = categoryUserId
        };

        var deck = new Deck
        {
            Name = "Biology",
            Description = "Basics",
            Category = category,
            CategoryId = category.Id
        };

        category.Decks = Enumerable.Range(0, siblingDeckCount)
            .Select(_ => new Deck
            {
                Name = "Sibling",
                Description = "Sibling deck",
                Category = category,
                CategoryId = category.Id
            })
            .ToList();

        if (!category.Decks.Any(d => d.Id == deck.Id))
        {
            category.Decks = [deck, .. category.Decks.Skip(1)];
        }

        return deck;
    }
}
