using System;
using FlashCardTool.Application.Users;
using MediatR;

namespace FlashCardTool.API.Endpoints;

public static class UserEndpoints
{
    private const string RoutePrefix = "api/users";

    private static void GetCurrentUser(RouteGroupBuilder group)
    {
        group.MapGet("/me", async (
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new GetCurrentUserQuery(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetCurrentUser")
        .WithDescription("Returns the currently authenticated user")
        .Produces<GetCurrentUserQueryResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }

    public static void DefineEndpoints(WebApplication app)
    {
        var users = app
        .MapGroup(RoutePrefix)
        .WithTags("Users")
        .RequireAuthorization();

        GetCurrentUser(users);
    }
}
