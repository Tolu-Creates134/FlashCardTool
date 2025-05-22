using FlashCardTool.Application.Categories;
using MediatR;

namespace FlashCardTool.API.Endpoints;

public static class CategoryEndpoints
{
    private const string RoutePrefix = "categories";

    public static void DefineEndpoints(WebApplication app)
    {
        var categories = app
        .MapGroup(RoutePrefix)
        .WithTags("Categories");

        CreateCategory(categories);
    }

    public static void CreateCategory(this RouteGroupBuilder group)
    {
        group.MapPost("/", async (
            CreateCategoryCommand command,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(command, cancellationToken);
            return Results.Created($"/api/categories/{result.Id}", result);
        })
        .WithName("CreateCategory")
        .WithDescription("Creates a new category")
        .Produces<CreateCategoryResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest);
    }
}
