using AutoMapper;
using FluentAssertions;
using FlashCardTool.Application.Categories;
using FlashCardTool.Application.Common.Mappings;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using Moq;

namespace FlashCardTool.Application.Tests.Categories;

public class CreateCategoryCommandHandlerTests
{
    private readonly IMapper mapper;
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly Mock<IGenericRepository<Category>> categoryRepositoryMock;
    private readonly CreateCategoryCommandHandler handler;

    public CreateCategoryCommandHandlerTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<CategoryProfile>());
        mapper = config.CreateMapper();

        unitOfWorkMock = new Mock<IUnitOfWork>();
        currentUserServiceMock = new Mock<ICurrentUserService>();
        categoryRepositoryMock = new Mock<IGenericRepository<Category>>();

        unitOfWorkMock
            .Setup(x => x.Repository<Category>())
            .Returns(categoryRepositoryMock.Object);

        handler = new CreateCategoryCommandHandler(
            unitOfWorkMock.Object,
            mapper,
            currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserIdIsMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns((Guid?)null);

        var act = async () => await handler.Handle(
            new CreateCategoryCommand(new CategoryDto(Guid.Empty, "Science")),
            CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Current user identifier is required.");
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenNameAndEmailAreMissing()
    {
        currentUserServiceMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        currentUserServiceMock.Setup(x => x.Name).Returns((string?)null);
        currentUserServiceMock.Setup(x => x.Email).Returns((string?)null);

        var act = async () => await handler.Handle(
            new CreateCategoryCommand(new CategoryDto(Guid.Empty, "Science")),
            CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Current user name or email is required.");
    }

    [Fact]
    public async Task Handle_ShouldUseNameAsCreatedBy_WhenNameIsAvailable()
    {
        var userId = Guid.NewGuid();
        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        currentUserServiceMock.Setup(x => x.Name).Returns("Tolu");
        currentUserServiceMock.Setup(x => x.Email).Returns("tolu@example.com");

        Category? capturedCategory = null;
        categoryRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()))
            .Callback<Category, CancellationToken>((category, _) => capturedCategory = category)
            .ReturnsAsync((Category category, CancellationToken _) => category);

        var result = await handler.Handle(
            new CreateCategoryCommand(new CategoryDto(Guid.Empty, "Science")),
            CancellationToken.None);

        result.Category.Name.Should().Be("Science");
        capturedCategory.Should().NotBeNull();
        capturedCategory!.UserId.Should().Be(userId);
        capturedCategory.CreatedBy.Should().Be("Tolu");

        categoryRepositoryMock.Verify(
            x => x.AddAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()),
            Times.Once);
        unitOfWorkMock.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldFallbackToEmail_WhenNameIsMissing()
    {
        var userId = Guid.NewGuid();
        currentUserServiceMock.Setup(x => x.UserId).Returns(userId);
        currentUserServiceMock.Setup(x => x.Name).Returns((string?)null);
        currentUserServiceMock.Setup(x => x.Email).Returns("tolu@example.com");

        Category? capturedCategory = null;
        categoryRepositoryMock
            .Setup(x => x.AddAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()))
            .Callback<Category, CancellationToken>((category, _) => capturedCategory = category)
            .ReturnsAsync((Category category, CancellationToken _) => category);

        await handler.Handle(
            new CreateCategoryCommand(new CategoryDto(Guid.Empty, "Science")),
            CancellationToken.None);

        capturedCategory.Should().NotBeNull();
        capturedCategory!.CreatedBy.Should().Be("tolu@example.com");
    }
}
