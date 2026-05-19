using AutoMapper;
using FluentAssertions;
using FlashCardTool.Application.Common.Mappings;
using FlashCardTool.Application.Decks;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Exceptions;
using FlashCardTool.Domain.Interfaces;
using Moq;

namespace FlashCardTool.Application.Tests.Decks;

public class GetDeckByIdQueryHandlerTests
{
    private readonly IMapper mapper;
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IGenericRepository<Deck>> deckRepositoryMock;
    private readonly GetDeckByIdQueryHandler handler;

    public GetDeckByIdQueryHandlerTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<DeckProfile>());
        mapper = config.CreateMapper();

        unitOfWorkMock = new Mock<IUnitOfWork>();
        currentUserServiceMock = new Mock<ICurrentUserService>();
        deckRepositoryMock = new Mock<IGenericRepository<Deck>>();

        unitOfWorkMock.Setup(x => x.Repository<Deck>()).Returns(deckRepositoryMock.Object);

        handler = new GetDeckByIdQueryHandler(
            unitOfWorkMock.Object,
            mapper,
            currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns((Guid?)null);

        var act = async () => await handler.Handle(new GetDeckByIdQuery(Guid.NewGuid()), CancellationToken.None);

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

        var act = async () => await handler.Handle(new GetDeckByIdQuery(Guid.NewGuid()), CancellationToken.None);

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
            .ReturnsAsync(BuildDeck(Guid.NewGuid()));

        var act = async () => await handler.Handle(new GetDeckByIdQuery(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenOperationException>()
            .WithMessage("Cannot access a deck that does not belong to the current user.");
    }

    [Fact]
    public async Task Handle_ShouldReturnMappedDeck_WhenDeckBelongsToCurrentUser()
    {
        var userId = Guid.NewGuid();
        var deck = BuildDeck(userId);

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        deckRepositoryMock
            .Setup(x => x.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Deck, bool>>>(),
                It.IsAny<Func<IQueryable<Deck>, Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Deck, object>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(deck);

        var result = await handler.Handle(new GetDeckByIdQuery(deck.Id), CancellationToken.None);

        result.Deck.Name.Should().Be(deck.Name);
        result.Deck.Description.Should().Be(deck.Description);
        result.Deck.CategoryId.Should().Be(deck.CategoryId);
        result.Deck.CategoryName.Should().Be(deck.Category.Name);
        result.Deck.FlashCards.Should().HaveCount(2);
    }

    private static Deck BuildDeck(Guid categoryUserId)
    {
        var category = new Category
        {
            Name = "Science",
            UserId = categoryUserId
        };

        return new Deck
        {
            Name = "Biology",
            Description = "Basics",
            Category = category,
            CategoryId = category.Id,
            Flashcards =
            [
                new FlashCard { Question = "Q1", Answer = "A1" },
                new FlashCard { Question = "Q2", Answer = "A2" }
            ]
        };
    }
}
