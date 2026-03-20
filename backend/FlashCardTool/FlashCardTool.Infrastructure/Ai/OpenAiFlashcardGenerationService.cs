using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Application.Models;
using Microsoft.Extensions.Options;

namespace FlashCardTool.Infrastructure.Ai;

public sealed class OpenAiFlashcardGenerationService : IAiFlashcardGenerationService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly AiProviderOptions options;
    private readonly HttpClient httpClient;

    public OpenAiFlashcardGenerationService(
        IOptions<AiProviderOptions> options,
        HttpClient httpClient
    )
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(httpClient);

        this.options = options.Value;
        this.httpClient = httpClient;

        if (!string.IsNullOrWhiteSpace(this.options.BaseUrl))
        {
            this.httpClient.BaseAddress = new Uri(this.options.BaseUrl);
        }
    }

    public async Task<IReadOnlyList<GeneratedFlashCardDto>> GenerateAsync(
        AiGenerationInput input,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(input);

        if (string.IsNullOrWhiteSpace(options.ApiKey))
        {
            throw new InvalidOperationException("OpenAI API key is missing.");
        }

        if (string.IsNullOrWhiteSpace(options.Model))
        {
            throw new InvalidOperationException("AI model configuration is missing.");
        }

        var trimmedText = input.SourceText.Trim();
        if (trimmedText.Length > options.MaxInputCharacters)
        {
            trimmedText = trimmedText[..options.MaxInputCharacters];
        }

        var requestedCount = input.TargetCardCount ?? 10;
        var cardCount = Math.Clamp(requestedCount, 1, options.MaxGeneratedCards);

        using var request = new HttpRequestMessage(HttpMethod.Post, "responses");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);

        request.Content = JsonContent.Create(new
        {
            model = options.Model,
            input = new object[]
            {
                new
                {
                    role = "system",
                    content = new object[]
                    {
                        new
                        {
                            type = "input_text",
                            text =
                                "You generate concise study flashcards. " +
                                "Return only valid JSON matching the provided schema. " +
                                "Avoid duplicates. Do not invent facts not supported by the source."
                        }
                    }
                },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "input_text",
                            text = BuildUserPrompt(trimmedText, input.Instructions, cardCount)
                        }
                    }
                }
            },
            text = new
            {
                format = new
                {
                    type = "json_schema",
                    name = "flashcards_response",
                    strict = true,
                    schema = new
                    {
                        type = "object",
                        additionalProperties = false,
                        properties = new
                        {
                            flashCards = new
                            {
                                type = "array",
                                items = new
                                {
                                    type = "object",
                                    additionalProperties = false,
                                    properties = new
                                    {
                                        question = new { type = "string" },
                                        answer = new { type = "string" }
                                    },
                                    required = new[] { "question", "answer" }
                                }
                            }
                        },
                        required = new[] { "flashCards" }
                    }
                }
            }
        });

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"OpenAI request failed with status {(int)response.StatusCode}: {responseBody}");
        }

        var payload = ExtractStructuredPayload(responseBody);

        var cards = payload.FlashCards
        .Where(card =>
            !string.IsNullOrWhiteSpace(card.Question) &&
            !string.IsNullOrWhiteSpace(card.Answer))
        .Select(card => new GeneratedFlashCardDto(
            card.Question.Trim(),
            card.Answer.Trim()))
        .ToList();

        if (cards.Count == 0)
        {
            throw new InvalidOperationException("OpenAI returned no valid flashcards.");
        }

        return cards;
    }

    private static string BuildUserPrompt(string sourceText, string? instructions, int cardCount)
    {
        var prompt =
            $"Generate {cardCount} flashcards from the following source material.\n\n" +
            "Each flashcard must have a clear question and a concise answer.\n" +
            "Use only the source material.\n";

        if (!string.IsNullOrWhiteSpace(instructions))
        {
            prompt += $"\nAdditional instructions:\n{instructions.Trim()}\n";
        }

        prompt += $"\nSource material:\n{sourceText}";
        return prompt;
    }

    private static FlashcardResponsePayload ExtractStructuredPayload(string responseJson)
    {
        using var document = JsonDocument.Parse(responseJson);

        var outputText = document.RootElement
            .GetProperty("output")
            .EnumerateArray()
            .SelectMany(message => message.GetProperty("content").EnumerateArray())
            .FirstOrDefault(content => content.GetProperty("type").GetString() == "output_text")
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(outputText))
        {
            throw new InvalidOperationException("OpenAI response did not contain structured output text.");
        }

        var payload = JsonSerializer.Deserialize<FlashcardResponsePayload>(outputText, JsonOptions);

        if (payload is null)
        {
            throw new InvalidOperationException("Unable to parse OpenAI structured output.");
        }

        return payload;
    }

    private sealed record FlashcardResponsePayload(List<FlashcardItemPayload> FlashCards);

    private sealed record FlashcardItemPayload(string Question, string Answer);
}
