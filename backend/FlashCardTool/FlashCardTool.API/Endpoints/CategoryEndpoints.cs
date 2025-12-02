using FlashCardTool.Application.Categories;
using FlashCardTool.Application.Models;
using MediatR;

namespace FlashCardTool.API.Endpoints;

public static class CategoryEndpoints
{
    private const string RoutePrefix = "api/categories";

    public static void CreateCategory(this RouteGroupBuilder group)
    {
        group.MapPost("/", async (
            CreateCategoryCommand command,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(command, cancellationToken);
            return Results.Created($"/api/categories/{result.Category.Id}", result);
        })
        .WithName("CreateCategory")
        .WithDescription("Creates a new category")
        .Produces<CreateCategoryResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest);
    }

    public static void ListCategories(this RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new ListAllCategoriesQuery(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("ListCategories")
        .WithDescription("Returns all categories")
        .Produces<List<CategoryDto>>(StatusCodes.Status200OK);
    }

    public static void DefineEndpoints(WebApplication app)
    {
        var categories = app
        .MapGroup(RoutePrefix)
        .WithTags("Categories")
        .RequireAuthorization();

        CreateCategory(categories);
        ListCategories(categories);
    }
}
