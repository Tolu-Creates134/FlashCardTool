using System;
using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Models;
using MediatR;

namespace FlashCardTool.API.Endpoints;

public static class DeckEndpoints
{
    private const string RoutePrefix = "api/decks";

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

    private static void ListAllDecks(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new ListAllDecksQuery(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("ListAllDecks")
        .WithDescription("Returns all decks for the current user")
        .Produces<ListAllDecksResponse>(StatusCodes.Status200OK);
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

    private static void UpdateDeck(RouteGroupBuilder group)
    {
        group.MapPut("/{deckId:guid}", async (
            Guid deckId,
            DeckDto deckDto,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var command = new UpdateDeckCommand(deckId, deckDto);
            await mediator.Send(command, cancellationToken);
            return Results.NoContent();
        })
        .WithName("UpdateDeck")
        .WithDescription("Updates an existing deck and its associated flashcards.")
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }

    public static void DefineEndpoints(WebApplication app)
    {
        var decks = app
        .MapGroup(RoutePrefix)
        .WithTags("Decks")
        .RequireAuthorization();

        CreateDeck(decks);
        ListAllDecks(decks);
        DeleteDeck(decks);
        UpdateDeck(decks);
    }
}
