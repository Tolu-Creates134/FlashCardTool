using System;
using FlashCardTool.API.Models;

namespace FlashCardTool.API.Middleware;

public class StatusCodePageMiddleware
{
    private readonly RequestDelegate _next;

    public StatusCodePageMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        if (context.Response.HasStarted || context.Response.ContentLength > 0)
        {
            return;
        }

        context.Response.ContentType = "application/json";

        var message = context.Response.StatusCode switch
        {
            StatusCodes.Status401Unauthorized => "Authentication is required to access this resource",
            StatusCodes.Status403Forbidden => "You do not have permission to access this resource",
            StatusCodes.Status404NotFound => "The requested resource was not found",
            StatusCodes.Status400BadRequest => "The request was invalid",
            _ => "The request could not be processed"
        };

        var error = context.Response.StatusCode switch
        {
            StatusCodes.Status401Unauthorized => "Unauthorized",
            StatusCodes.Status403Forbidden => "Forbidden",
            StatusCodes.Status404NotFound => "NotFound",
            StatusCodes.Status400BadRequest => "BadRequest",
            _ => "RequestError"
        };

        await context.Response.WriteAsJsonAsync(new ApiErrorResponse
        (
            error,
            message,
            context.Response.StatusCode,
            context.TraceIdentifier
        ));
    }

}
