using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using FlashCardTool.Domain.Interfaces;

namespace FlashCardTool.Infrastructure.Auth;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User =>
        httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var idValue = User?.FindFirst("userId")?.Value;
            return Guid.TryParse(idValue, out var id) ? id : null;
        }
    }

    public string? Email =>
        User?.FindFirst(ClaimTypes.Email)?.Value
        ?? User?.FindFirst("email")?.Value;

    public string? Name =>
        User?.FindFirst("name")?.Value;

    public string? PictureUrl =>
        User?.FindFirst("picture")?.Value;

}