using System;
using FlashCardTool.API.Models;
using FlashCardTool.Domain.Exceptions;
using Google.Apis.Auth;

namespace FlashCardTool.API.Middleware;

/// <summary>
/// Middlware for handling exceptions, and returning a standardized error format.
/// </summary>
public class UnhandledExceptionMiddleware
{
    private readonly ILogger<UnhandledExceptionMiddleware> _logger;
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _environment;

    public UnhandledExceptionMiddleware(
        ILogger<UnhandledExceptionMiddleware> logger, 
        RequestDelegate next,
        IHostEnvironment environment
    )
    {
        _logger = logger;
        _next = next;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context); // 🟢 Pass request to next middleware
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex); // 🔴 Catch any exception
        }
    }

    public async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, error, message) = MapException(exception);

        _logger.LogError(
            exception,
            "Unhandled exception for {Method} {Path}. StatusCode={StatusCode} TraceId={TraceId}",
            context.Request.Method,
            context.Request.Path,
            statusCode,
            context.TraceIdentifier
        );

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse
        (
            error,
            message,
            statusCode,
            context.TraceIdentifier
        );

        await context.Response.WriteAsJsonAsync(response);
    }

    private (int StatusCode, string Error, string Message) MapException(Exception exception)
    {
        return exception switch
        {
            EntityNotFoundException ex => (
                StatusCodes.Status404NotFound,
                "NotFound",
                ex.Message
            ),

            UnauthorizedAccessException ex => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                ex.Message
            ),

            InvalidJwtException ex => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                ex.Message
            ),

            InvalidOperationException ex => (
                StatusCodes.Status400BadRequest,
                "InvalidOperation",
                ex.Message
            ),

            BadHttpRequestException ex => (
                StatusCodes.Status400BadRequest,
                "BadRequest",
                ex.Message
            ),

            _ => (
                StatusCodes.Status500InternalServerError,
                "InternalServerError",
                _environment.IsDevelopment()
                    ? exception.Message
                    : "An unexpected error occurred"
            )
        };
    }
}
