namespace FlashCardTool.API.Models;

public record class ApiErrorResponse(
    string Error,
    string Message,
    int StatusCode,
    string TraceId
);
