using AutoMapper;
using FluentAssertions;
using FlashCardTool.Application.Common.Mappings;
using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Tests.Common.AsyncQuery;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using Moq;

namespace FlashCardTool.Application.Tests.Decks;

public class ListAllDecksQueryHandlerTests
{
    private readonly IMapper mapper;
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IGenericRepository<Category>> categoryRepositoryMock;
    private readonly Mock<IGenericRepository<Deck>> deckRepositoryMock;
    private readonly ListAllDecksQueryHandler handler;

    public ListAllDecksQueryHandlerTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<DeckProfile>());
        mapper = config.CreateMapper();

        unitOfWorkMock = new Mock<IUnitOfWork>();
        currentUserServiceMock = new Mock<ICurrentUserService>();
        categoryRepositoryMock = new Mock<IGenericRepository<Category>>();
        deckRepositoryMock = new Mock<IGenericRepository<Deck>>();

        unitOfWorkMock.Setup(x => x.Repository<Category>()).Returns(categoryRepositoryMock.Object);
        unitOfWorkMock.Setup(x => x.Repository<Deck>()).Returns(deckRepositoryMock.Object);

        handler = new ListAllDecksQueryHandler(
            unitOfWorkMock.Object,
            mapper,
            currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns((Guid?)null);

        var act = async () => await handler.Handle(new ListAllDecksQuery(), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Current user identifier is required.");
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyResponse_WhenUserHasNoCategories()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        categoryRepositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await handler.Handle(new ListAllDecksQuery(), CancellationToken.None);

        result.Decks.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldReturnOnlyDecksInUsersCategories()
    {
        var userId = Guid.NewGuid();
        var categoryA = new Category { Name = "Science", UserId = userId };
        var categoryB = new Category { Name = "History", UserId = userId };
        var otherCategory = new Category { Name = "Other", UserId = Guid.NewGuid() };

        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        categoryRepositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync([categoryA, categoryB]);

        var decks = new List<Deck>
        {
            new()
            {
                Name = "Biology",
                Description = "Basics",
                Category = categoryA,
                CategoryId = categoryA.Id,
                Flashcards = [new FlashCard(), new FlashCard()]
            },
            new()
            {
                Name = "World War II",
                Description = "Events",
                Category = categoryB,
                CategoryId = categoryB.Id,
                Flashcards = [new FlashCard()]
            },
            new()
            {
                Name = "Should be filtered out",
                Description = "Other",
                Category = otherCategory,
                CategoryId = otherCategory.Id,
                Flashcards = [new FlashCard(), new FlashCard(), new FlashCard()]
            }
        };

        deckRepositoryMock
            .Setup(x => x.Query())
            .Returns(new TestAsyncEnumerable<Deck>(decks));

        var result = await handler.Handle(new ListAllDecksQuery(), CancellationToken.None);

        result.Decks.Should().HaveCount(2);
        result.Decks.Select(x => x.Name).Should().BeEquivalentTo(["Biology", "World War II"]);
        result.Decks.Should().Contain(x => x.Name == "Biology" && x.FlashCardCount == 2);
        result.Decks.Should().Contain(x => x.Name == "World War II" && x.FlashCardCount == 1);
    }
}
