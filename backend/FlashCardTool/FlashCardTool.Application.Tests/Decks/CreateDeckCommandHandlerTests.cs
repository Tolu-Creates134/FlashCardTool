using AutoMapper;
using FluentAssertions;
using FlashCardTool.Application.Common.Mappings;
using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using Moq;
using Xunit;

namespace FlashCardTool.Application.Tests.Decks;

public class CreateDeckCommandHandlerTests
{
    private readonly IMapper mapper;
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IGenericRepository<Category>> categoryRepositoryMock;
    private readonly Mock<IGenericRepository<Deck>> deckRepositoryMock;
    private readonly CreateDeckCommandHandler handler;

    public CreateDeckCommandHandlerTests()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<DeckProfile>();
        });

        mapper = config.CreateMapper();

        unitOfWorkMock = new Mock<IUnitOfWork>();
        currentUserServiceMock = new Mock<ICurrentUserService>();
        categoryRepositoryMock = new Mock<IGenericRepository<Category>>();
        deckRepositoryMock = new Mock<IGenericRepository<Deck>>();

        unitOfWorkMock
        .Setup(x => x.Repository<Category>())
        .Returns(categoryRepositoryMock.Object);

        unitOfWorkMock
        .Setup(x => x.Repository<Deck>())
        .Returns(deckRepositoryMock.Object);

        handler = new CreateDeckCommandHandler(
            unitOfWorkMock.Object,
            mapper,
            currentUserServiceMock.Object
        );
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns((Guid?)null);

        var command = new CreateDeckCommand(BuildDeckDto());

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Current user identifier is required.");
    }

    [Fact]
    public async Task Handle_ShouldThrowEntityNotFoundException_WhenCategoryDoesNotExist()
    {
        var userId = Guid.NewGuid();
        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

        categoryRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category?)null);

        var command = new CreateDeckCommand(BuildDeckDto());

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<EntityNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowForbiddenOperationException_WhenCategoryBelongsToAnotherUser()
    {
        var currentUserId = Guid.NewGuid();
        var categoryOwnerId = Guid.NewGuid();

        currentUserServiceMock.Setup(x => x.UserId).Returns(currentUserId);

        categoryRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Category
            {
                Id = Guid.NewGuid(),
                Name = "Science",
                UserId = categoryOwnerId
            });

        var command = new CreateDeckCommand(BuildDeckDto());

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenOperationException>()
            .WithMessage("Cannot create a deck in a category that does not belong to the current user.");
    }

    [Fact]
    public async Task Handle_ShouldCreateDeckAndSaveChanges_WhenCategoryBelongsToCurrentUser()
    {
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

        categoryRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Category
            {
                Id = categoryId,
                Name = "Science",
                UserId = userId
            });

        Deck? capturedDeck = null;

        deckRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Deck>(), It.IsAny<CancellationToken>()))
            .Callback<Deck, CancellationToken>((deck, _) => capturedDeck = deck)
            .ReturnsAsync((Deck deck, CancellationToken _) => deck);

        unitOfWorkMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new CreateDeckCommand(BuildDeckDto(categoryId));

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Id.Should().NotBeEmpty();
        result.Deck.Name.Should().Be("Biology Basics");
        result.Deck.CategoryId.Should().Be(categoryId);

        capturedDeck.Should().NotBeNull();
        capturedDeck!.CategoryId.Should().Be(categoryId);
        capturedDeck.Flashcards.Should().HaveCount(2);
        capturedDeck.Flashcards.Should().OnlyContain(x => x.DeckId == capturedDeck.Id);

        deckRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<Deck>(), It.IsAny<CancellationToken>()),
            Times.Once);

        unitOfWorkMock.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static DeckDto BuildDeckDto(Guid? categoryId = null)
    {
        return new DeckDto(
            "Biology Basics",
            "Introductory biology deck",
            categoryId ?? Guid.NewGuid(),
            null,
            new List<FlashCardDto>
            {
                new(null, "What is a cell?", "The basic unit of life"),
                new(null, "What carries genetic information?", "DNA")
            });
    }

}
