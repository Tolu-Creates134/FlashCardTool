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
        GetAllDecks(decks);
        DeleteDeck(decks);
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

    private static void GetAllDecks(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new GetAllDecksQuery(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetAllDecks")
        .WithDescription("Returns all decks")
        .Produces<GetAllDecksResponse>(StatusCodes.Status200OK);
    }

    private static void DeleteDeck(RouteGroupBuilder group)
    {
        group.MapDelete("/{id:guid}", async (
            Guid id,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            await mediator.Send(new DeleteDeckCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("DeleteDeck")
        .WithDescription("Deletes a deck by ID")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);
    }

}
