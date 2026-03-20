using System;
using FlashCardTool.API.Models;
using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Common.Enums;
using FlashCardTool.Application.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FlashCardTool.API.Endpoints;

public static class AiFlashcardEndpoints
{
    private const string RoutePrefix = "api/decks";

    private static void GenerateForDeck(RouteGroupBuilder group)
    {
        group.MapPost("/{deckId:guid}/ai/generate", async (
            Guid deckId,
            [FromForm] GenerateFlashcardsRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                return Results.BadRequest(new { message = "Request body is required"});
            }

            var hasText = !string.IsNullOrWhiteSpace(request.Text);
            var hasFile = request.File is not null;

            if (!hasText && !hasFile)
            {
                return Results.BadRequest(new { message = "Provide either text or a file." });
            }

            if (request.TargetCardCount is < 1 or > 50)
            {
                return Results.BadRequest(new { message = "TargetCardCount must be between 1 and 50." });
            }

            var sourceType = ResolveSourceType(request);
            await using var fileStream = request.File?.OpenReadStream();

            var command = new GenerateFlashcardsCommand(
                deckId,
                new AiContentSource(
                    sourceType,
                    request.Text,
                    request.File?.FileName,
                    request.File?.ContentType,
                    fileStream),
                request.Instructions?.Trim(),
                request.TargetCardCount);

            var result = await mediator.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .DisableAntiforgery()
        .WithName("GenerateFlashcardsForDeck")
        .WithDescription("Generates flashcards with AI for the specified deck")
        .Accepts<GenerateFlashcardsRequest>("multipart/form-data")
        .Produces<GenerateFlashcardsResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static void GeneratePreview(RouteGroupBuilder group)
    {
        group.MapPost("/ai/generate-preview", async (
            [FromForm] GenerateFlashcardsRequest request,
            IMediator mediator,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                return Results.BadRequest(new { message = "Request body is required." });
            }

            var hasText = !string.IsNullOrWhiteSpace(request.Text);
            var hasFile = request.File is not null;

            if (!hasText && !hasFile)
            {
                return Results.BadRequest(new { message = "Provide either text or a file." });
            }

            if (request.TargetCardCount is < 1 or > 50)
            {
                return Results.BadRequest(new { message = "TargetCardCount must be between 1 and 50." });
            }

            var sourceType = ResolveSourceType(request);
            await using var fileStream = request.File?.OpenReadStream();

            var command = new GenerateFlashcardsCommand(
                null,
                new AiContentSource(
                    sourceType,
                    request.Text,
                    request.File?.FileName,
                    request.File?.ContentType,
                    fileStream),
                request.Instructions?.Trim(),
                request.TargetCardCount);

            var result = await mediator.Send(command, cancellationToken);
            return Results.Ok(result);
            
        })
        .DisableAntiforgery()
        .WithName("GenerateFlashcardsPreview")
        .WithDescription("Generates flashcards with AI before a deck has been created")
        .Accepts<GenerateFlashcardsRequest>("multipart/form-data")
        .Produces<GenerateFlashcardsResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest);
    }

    private static AiSourceType ResolveSourceType(GenerateFlashcardsRequest request)
    {
        if (request.File is null)
        {
            return AiSourceType.Text;
        }

        var contentType = request.File.ContentType?.ToLowerInvariant();

        return contentType switch
        {
            "application/pdf" => AiSourceType.Pdf,
            "image/png" => AiSourceType.Image,
            "image/jpeg" => AiSourceType.Image,
            "image/jpg" => AiSourceType.Image,
            "image/webp" => AiSourceType.Image,
            _ => throw new BadHttpRequestException("Unsupported file type.")
        };
    }

    public static void DefineEndpoints(WebApplication app)
    {
        var decks = app
        .MapGroup(RoutePrefix)
        .WithTags("AI Flashcards")
        .RequireAuthorization();

        GenerateForDeck(decks);
        GeneratePreview(decks);
    }
}
