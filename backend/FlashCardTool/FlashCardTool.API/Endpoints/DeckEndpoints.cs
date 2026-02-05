using System;
using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Models;
using FlashCardTool.Application.PractiseSessions;
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

    private static void GetDeckById(RouteGroupBuilder group)
    {
        group.MapGet("/{deckId:guid}", async (
            Guid deckId,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new GetDeckByIdQuery(deckId), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetDeckById")
        .WithDescription("Returns a deck and its flashcards by ID")
        .Produces<GetDeckByIdResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }

    private static void UpdateDeckByDeckId(RouteGroupBuilder group)
    {
        group.MapPut("/{deckId:guid}", async (
            Guid deckId,
            DeckDto deckData,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            await mediator.Send(new UpdateDeckByDeckIdCommand(deckId, deckData), cancellationToken);
            return Results.NoContent();
        })
        .WithName("UpdateDeckByDeckId")
        .WithDescription("Updates a deck and its corresponding flashcards")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status500InternalServerError);
    }

    private static void CreatePraciseSession(RouteGroupBuilder group)
    {
        group.MapPost("/{deckId:guid}/practise-sessions", async (
            Guid deckId,
            CreatePractiseSessionRequest request,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var command = new CreatePractiseSessionCommand(
                deckId,
                request.CorrectCount,
                request.TotalCount,
                request.CompletionTime,
                request.ResponseJson
            );

            var result = await mediator.Send(command);

            return Results.Ok(result);
        })
        .WithName("CreatePractiseSession")
        .WithDescription("Creates a practise session for the current user")
        .Produces<PractiseSessionDto>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static void ListPractiseSessions(RouteGroupBuilder group)
    {
        group.MapGet("/{deckId:guid}/practise-sessions", async (
            Guid deckId,
            int? pageNumber,
            int? pageSize,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var query = new ListPractiseSessionsByDeckIdQuery(deckId, pageNumber, pageSize);
            var result = await mediator.Send(query, cancellationToken);

            return Results.Ok(result);     
        })
        .WithName("ListPractiseSession")
        .WithDescription("Returns practise session history for the current user")
        .Produces<ListPractiseSessionsByDeckIdQueryResponse>(StatusCodes.Status200OK)
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
        GetDeckById(decks);
        DeleteDeck(decks);
        UpdateDeckByDeckId(decks);
        CreatePraciseSession(decks);
        ListPractiseSessions(decks);
    }
}
