using FlashCardTool.Application.Models;
using FlashCardTool.Application.Users;
using FlashCardTool.Infrastructure.Auth;
using Google.Apis.Auth;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FlashCardTool.API.Endpoints;

public static class AuthenticationEndpoints
{
    private const string RoutePrefix = "api/auth";

    private static void GoogleLogin(RouteGroupBuilder group)
    {
        group.MapPost("/google-login", async (
            [FromBody] GoogleLoginRequest request,
            IConfiguration config,
            IMediator mediator
        ) =>
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

                var saveUserResult = await mediator.Send(new SaveUserCommand(
                    payload.Name,
                    payload.Email,
                    payload.Picture
                ));

                var userId = saveUserResult.Id;

                var refreshToken = saveUserResult.refreshToken;

                var accessToken = JwtHelper.GenerateJwtToken(
                    userId,
                    payload.Email,
                    payload.Name,
                    payload.Picture,
                    config,
                    15 // minutes
                );

                return Results.Ok(new
                {
                    accessToken,
                    refreshToken,
                    email = payload.Email
                });
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Google login failed: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return Results.Unauthorized();
            }
        })
        .WithName("GoogleLogin")
        .WithDescription("Handles Google login and issues access/refresh tokens")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);
    }

    private static void RefreshToken(RouteGroupBuilder group)
    {
        group.MapPost("/refresh",  async(
            [FromBody] RefreshTokenRequest request,
            IConfiguration config,
            IMediator mediator
        ) =>
        {
            var result = await mediator.Send(new RefreshTokenCommand(request.RefreshToken));

            return Results.Ok(result);
        })
        .WithName("RefreshToken")
        .WithDescription("Issues a new access/refresh token pair for a valid refresh token")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);
    }

    public static void DefineEndpoints(WebApplication app)
    {
        var authGroup = app
        .MapGroup(RoutePrefix)
        .AllowAnonymous()
        .WithTags("Auth");

        GoogleLogin(authGroup);
        RefreshToken(authGroup);
    }
}
