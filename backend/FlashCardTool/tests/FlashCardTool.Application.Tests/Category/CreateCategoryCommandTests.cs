using FlashCardTool.Application.Categories;
using FlashCardTool.Application.Models;
using FlashCardTool.Application.Tests.Common;
using Xunit;
using DomainCategory = FlashCardTool.Domain.Entities.Category;

namespace FlashCardTool.Application.Tests.Category;

public class CreateCategoryCommandTests
{
    [Fact]
    public async Task Handle_sets_current_user_fields_and_persists_category()
    {
        var userId = Guid.NewGuid();
        var categoryRepository = new InMemoryRepository<DomainCategory>();
        var unitOfWork = new FakeUnitOfWork()
            .WithRepository(categoryRepository);
        var currentUser = new FakeCurrentUserService(userId, "owner@example.com", "Owner Name");
        var handler = new CreateCategoryCommandHandler(unitOfWork, TestInfrastructure.Mapper, currentUser);

        var result = await handler.Handle(
            new CreateCategoryCommand(new CategoryDto(Guid.Empty, "Biology")),
            CancellationToken.None);

        var persisted = Assert.Single(categoryRepository.Items);
        Assert.Equal(userId, persisted.UserId);
        Assert.Equal("Owner Name", persisted.CreatedBy);
        Assert.Equal("Biology", persisted.Name);
        Assert.Equal(1, unitOfWork.SaveChangesCalls);
        Assert.Equal("Biology", result.Category.Name);
    }
}
