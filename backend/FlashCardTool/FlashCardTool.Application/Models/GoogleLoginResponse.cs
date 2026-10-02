namespace FlashCardTool.API.Models;
public record class GoogleLoginResponse(
    string AccessToken,
    string RefreshToken,
    string Email
);