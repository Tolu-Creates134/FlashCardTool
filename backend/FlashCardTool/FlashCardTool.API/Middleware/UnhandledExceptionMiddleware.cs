using System;
using FlashCardTool.Domain.Exceptions;

namespace FlashCardTool.API.Middleware;

/// <summary>
/// Middlware for handling exceptions, and returning a standardized error format.
/// </summary>
public class UnhandledExceptionMiddleware
{
    private readonly ILogger<UnhandledExceptionMiddleware> _logger;
    private readonly RequestDelegate _next;

    public UnhandledExceptionMiddleware(ILogger<UnhandledExceptionMiddleware> logger, RequestDelegate next)
    {
        _logger = logger;
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context); // 🟢 Pass request to next middleware
        }
        catch (Exception ex)
        {
            await HandleError(context, ex); // 🔴 Catch any exception
        }
    }

    public async Task HandleError(HttpContext context, Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception occurred");

        context.Response.ContentType = "application/json";

        if (ex is EntityNotFoundException entityEx)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;

            await context.Response.WriteAsJsonAsync(new
            {
                error = "Not Found",
                message = entityEx.Message,
                entity = entityEx.EntityName,
                id = entityEx.EntityId
            });
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            await context.Response.WriteAsJsonAsync(new
            {
                error = "Server Error",
                message = "An unexpected error occurred."
            });
        }
    }
}