using AutoMapper;
using FluentAssertions;
using FlashCardTool.Application.Categories;
using FlashCardTool.Application.Common.Mappings;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using Moq;

namespace FlashCardTool.Application.Tests.Categories;

public class ListAllCategoriesQueryHandlerTests
{
    private readonly IMapper mapper;
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IGenericRepository<Category>> categoryRepositoryMock;
    private readonly ListAllCategoriesQueryHandler handler;

    public ListAllCategoriesQueryHandlerTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<CategoryProfile>());
        mapper = config.CreateMapper();

        unitOfWorkMock = new Mock<IUnitOfWork>();
        currentUserServiceMock = new Mock<ICurrentUserService>();
        categoryRepositoryMock = new Mock<IGenericRepository<Category>>();

        unitOfWorkMock
            .Setup(x => x.Repository<Category>())
            .Returns(categoryRepositoryMock.Object);

        handler = new ListAllCategoriesQueryHandler(
            unitOfWorkMock.Object,
            mapper,
            currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns((Guid?)null);

        var act = async () => await handler.Handle(new ListAllCategoriesQuery(), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Current user identifier is required.");
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsEmpty()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.Empty);

        var act = async () => await handler.Handle(new ListAllCategoriesQuery(), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Current user identifier is required.");
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyList_WhenUserHasNoCategories()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        categoryRepositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var result = await handler.Handle(new ListAllCategoriesQuery(), CancellationToken.None);

        result.Categories.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldReturnMappedCategories_WhenUserHasCategories()
    {
        var userId = Guid.NewGuid();
        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);

        var categories = new List<Category>
        {
            new() { Id = Guid.NewGuid(), Name = "Science", UserId = userId },
            new() { Id = Guid.NewGuid(), Name = "History", UserId = userId }
        };

        categoryRepositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Category, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(categories);

        var result = await handler.Handle(new ListAllCategoriesQuery(), CancellationToken.None);

        result.Categories.Should().HaveCount(2);
        result.Categories.Select(x => x.Name).Should().BeEquivalentTo(["Science", "History"]);
        result.Categories.Select(x => x.Id).Should().BeEquivalentTo(categories.Select(x => x.Id));
    }
}
