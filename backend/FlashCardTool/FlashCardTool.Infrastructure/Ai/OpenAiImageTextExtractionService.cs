using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FlashCardTool.Application.AiFlashCards;
using Microsoft.Extensions.Options;

namespace FlashCardTool.Infrastructure.Ai;

public class OpenAiImageTextExtractionService : IImageTextExtractionService
{
    private readonly AiProviderOptions options;

    private readonly HttpClient httpClient;

    public OpenAiImageTextExtractionService(
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

    public async Task<string> ExtractTextAsync(Stream imageStream, string contentType, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(imageStream);

        if (string.IsNullOrWhiteSpace(options.ApiKey))
        {
            throw new InvalidOperationException("OpenAI API ket is missing");
        }

        if (string.IsNullOrWhiteSpace(options.VisionModel))
        {
            throw new InvalidOperationException("AI vision model configuration is missing.");
        }

        if (imageStream.CanSeek)
        {
            imageStream.Position = 0;
        }

        using var buffer = new MemoryStream();
        await imageStream.CopyToAsync(buffer, cancellationToken);

        var base64 = Convert.ToBase64String(buffer.ToArray());
        var dataUrl = $"data:{contentType};base64,{base64}";

        using var request = new HttpRequestMessage(HttpMethod.Post, "responses");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);

        request.Content = JsonContent.Create(new
        {
            model = options.VisionModel,
            input = new object[]
            {
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "input_text",
                            text =
                                "Extract all readable study-relevant text from this image. " +
                                "Return plain text only. Do not summarize. Do not add commentary."
                        },
                        new
                        {
                            type = "input_image",
                            image_url = dataUrl,
                            detail = "high"
                        }
                    }
                }
            }
        });

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"OpenAI image extraction request failed with status {(int)response.StatusCode}: {responseBody}");
        }

        var outputText = ExtractOutputText(responseBody);

        if (string.IsNullOrWhiteSpace(outputText))
        {
            throw new InvalidOperationException("OpenAI returned no readable text for the supplied image.");
        }

        return outputText.Trim();
    }

    private static string ExtractOutputText(string responseJson)
    {
        using var document = JsonDocument.Parse(responseJson);

        var outputText = document.RootElement
            .GetProperty("output")
            .EnumerateArray()
            .SelectMany(message => message.GetProperty("content").EnumerateArray())
            .FirstOrDefault(content => content.GetProperty("type").GetString() == "output_text")
            .GetProperty("text")
            .GetString();

        return outputText ?? string.Empty;
    }
}
