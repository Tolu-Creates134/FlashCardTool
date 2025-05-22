using System;
using FlashCardTool.Application.Decks;
using MediatR;

namespace FlashCardTool.API.Endpoints;

public static class DeckEndpoints
{
    private const string RoutePrefix = "decks";

    public static void DefineEndpoints(WebApplication app)
    {
        var decks = app
        .MapGroup(RoutePrefix)
        .WithTags("Decks");

        CreateDeck(decks);
    }

    private static void CreateDeck(RouteGroupBuilder group)
    {
        group.MapPost("/", async (
            CreateDeckCommand command,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(command, cancellationToken);
            return Results.Created($"/api/decks/{result.Id}", result);
        })
        .WithName("CreateDeck")
        .WithDescription("Creates a new deck with optional flashcards")
        .Produces<CreateDeckResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest);
    }

}
