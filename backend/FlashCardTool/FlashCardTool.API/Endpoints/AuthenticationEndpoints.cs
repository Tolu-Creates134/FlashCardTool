using FlashCardTool.Application.Models;
using FlashCardTool.Infrastructure.Auth;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;

namespace FlashCardTool.API.Endpoints;

public static class AuthenticationEndpoints
{
    private const string RoutePrefix = "api/auth";

    public static void DefineEndpoints(WebApplication app)
    {
        var authGroup = app
        .MapGroup(RoutePrefix)
        .WithTags("Auth");

        GoogleLogin(authGroup);
    }

    private static void GoogleLogin(RouteGroupBuilder group)
    {
        group.MapPost("/google-login", async (
            [FromBody] GoogleLoginRequest request,
            IConfiguration config
        ) =>
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

                var accessToken = JwtHelper.GenerateJwtToken(payload.Email, config, 15);
                var refreshToken = JwtHelper.GenerateJwtToken(payload.Email, config, 43200);

                return Results.Ok(new
                {
                    accessToken,
                    refreshToken,
                    email = payload.Email
                });
            }
            catch
            {
                return Results.Unauthorized();
            }
        })
        .WithName("GoogleLogin")
        .WithDescription("Handles Google login and issues access/refresh tokens")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);
    }
}
