using AutoMapper;
using FluentAssertions;
using FlashCardTool.Application.Common.Mappings;
using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using Moq;

namespace FlashCardTool.Application.Tests.Decks;

public class UpdateDeckByDeckIdCommandHandlerTests
{
    private readonly IMapper mapper;
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IGenericRepository<Deck>> deckRepositoryMock;
    private readonly Mock<IGenericRepository<Category>> categoryRepositoryMock;
    private readonly Mock<IGenericRepository<FlashCard>> flashCardRepositoryMock;
    private readonly UpdateDeckByDeckIdCommandHandler handler;

    public UpdateDeckByDeckIdCommandHandlerTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<DeckProfile>());
        mapper = config.CreateMapper();

        unitOfWorkMock = new Mock<IUnitOfWork>();
        currentUserServiceMock = new Mock<ICurrentUserService>();
        deckRepositoryMock = new Mock<IGenericRepository<Deck>>();
        categoryRepositoryMock = new Mock<IGenericRepository<Category>>();
        flashCardRepositoryMock = new Mock<IGenericRepository<FlashCard>>();

        unitOfWorkMock.Setup(x => x.Repository<Deck>()).Returns(deckRepositoryMock.Object);
        unitOfWorkMock.Setup(x => x.Repository<Category>()).Returns(categoryRepositoryMock.Object);
        unitOfWorkMock.Setup(x => x.Repository<FlashCard>()).Returns(flashCardRepositoryMock.Object);

        handler = new UpdateDeckByDeckIdCommandHandler(
            unitOfWorkMock.Object,
            mapper,
            currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns((Guid?)null);

        var act = async () => await handler.Handle(
            new UpdateDeckByDeckIdCommand(Guid.NewGuid(), BuildDeckDto(Guid.NewGuid())),
            CancellationToken.None);

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

        var act = async () => await handler.Handle(
            new UpdateDeckByDeckIdCommand(Guid.NewGuid(), BuildDeckDto(Guid.NewGuid())),
            CancellationToken.None);

        await act.Should().ThrowAsync<EntityNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowForbiddenOperationException_WhenDeckBelongsToAnotherUser()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildExistingDeck(Guid.NewGuid()));

        var act = async () => await handler.Handle(
            new UpdateDeckByDeckIdCommand(Guid.NewGuid(), BuildDeckDto(Guid.NewGuid())),
            CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenOperationException>()
            .WithMessage("Cannot update a deck that does not belong to the current user.");
    }

    [Fact]
    public async Task Handle_ShouldThrowEntityNotFoundException_WhenTargetCategoryDoesNotExist()
    {
        var userId = Guid.NewGuid();
        var existingDeck = BuildExistingDeck(userId);

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDeck);
        categoryRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);

        var act = async () => await handler.Handle(
            new UpdateDeckByDeckIdCommand(existingDeck.Id, BuildDeckDto(Guid.NewGuid())),
            CancellationToken.None);

        await act.Should().ThrowAsync<EntityNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowForbiddenOperationException_WhenTargetCategoryBelongsToAnotherUser()
    {
        var userId = Guid.NewGuid();
        var existingDeck = BuildExistingDeck(userId);
        var targetCategory = new Category { Name = "Other", UserId = Guid.NewGuid() };

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDeck);
        categoryRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(targetCategory);

        var act = async () => await handler.Handle(
            new UpdateDeckByDeckIdCommand(existingDeck.Id, BuildDeckDto(targetCategory.Id)),
            CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenOperationException>()
            .WithMessage("Cannot move a deck to a category that does not belong to the current user.");
    }

    [Fact]
    public async Task Handle_ShouldUpdateDeckAndFlashcards_WhenRequestIsValid()
    {
        var userId = Guid.NewGuid();
        var originalCategory = new Category { Name = "Science", UserId = userId };
        var targetCategory = new Category { Name = "History", UserId = userId };
        var existingDeck = BuildExistingDeck(userId, originalCategory);
        var existingFlashcard = existingDeck.Flashcards.First();
        var removedFlashcard = existingDeck.Flashcards.Last();

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDeck);
        categoryRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(targetCategory);
        deckRepositoryMock
            .Setup(x => x.UpdateAsync(It.IsAny<Deck>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Deck deck, CancellationToken _) => deck);

        var command = new UpdateDeckByDeckIdCommand(
            existingDeck.Id,
            new DeckDto(
                "Updated deck",
                "Updated description",
                targetCategory.Id,
                null,
                [
                    new FlashCardDto(existingFlashcard.Id, "Updated question", "Updated answer"),
                    new FlashCardDto(null, "New question", "New answer")
                ]));

        await handler.Handle(command, CancellationToken.None);

        existingDeck.Name.Should().Be("Updated deck");
        existingDeck.Description.Should().Be("Updated description");
        existingDeck.CategoryId.Should().Be(targetCategory.Id);

        existingFlashcard.Question.Should().Be("Updated question");
        existingFlashcard.Answer.Should().Be("Updated answer");

        existingDeck.Flashcards.Should().Contain(x => x.Question == "New question" && x.Answer == "New answer");
        existingDeck.Flashcards.Should().Contain(x => x.Id == removedFlashcard.Id);

        flashCardRepositoryMock.Verify(x => x.Remove(removedFlashcard), Times.Once);
        deckRepositoryMock.Verify(x => x.UpdateAsync(existingDeck, It.IsAny<CancellationToken>()), Times.Once);
        unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    private static Deck BuildExistingDeck(Guid categoryUserId, Category? category = null)
    {
        category ??= new Category { Name = "Science", UserId = categoryUserId };

        return new Deck
        {
            Name = "Original deck",
            Description = "Original description",
            Category = category,
            CategoryId = category.Id,
            Flashcards =
            [
                new FlashCard { Question = "Old question", Answer = "Old answer" },
                new FlashCard { Question = "Remove me", Answer = "Remove me too" }
            ]
        };
    }

    private static DeckDto BuildDeckDto(Guid categoryId)
    {
        return new DeckDto(
            "Updated deck",
            "Updated description",
            categoryId,
            null,
            [new FlashCardDto(null, "Question", "Answer")]);
    }
}
