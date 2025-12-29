using FlashCardTool.Application.FlashCards;
using MediatR;

namespace FlashCardTool.API.Endpoints;

public static class FlashCardEndpoints
{
    private const string RoutePrefix = "api/flashcards";

    private static void ListFlashCardsByDeckId(RouteGroupBuilder group)
    {
        group.MapGet("/{deckId:guid}", async (
            Guid deckId,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new ListFlashCardsByDeckIdQuery(deckId), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("ListFlashCardsByDeckId")
        .WithDescription("Returns all flashcards for the specified deck")
        .Produces<ListFlashCardsByDeckIdResponse>(StatusCodes.Status200OK);
    }

    public static void DefineEndpoints(WebApplication app)
    {
        var flashcards = app
            .MapGroup(RoutePrefix)
            .WithTags("FlashCards")
            .RequireAuthorization();

        ListFlashCardsByDeckId(flashcards);
    }
}
