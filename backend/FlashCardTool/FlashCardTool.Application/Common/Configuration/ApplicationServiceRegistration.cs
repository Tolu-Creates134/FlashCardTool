using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace FlashCardTool.Application.Common.Configuration;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register all MediatR handlers in Application layer
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Register all AutoMapper profiles
        services.AddAutoMapper(assembly);

        // Register FluentValidation (if you're using it)
        // services.AddValidatorsFromAssembly(assembly);

        return services;
    }

}
