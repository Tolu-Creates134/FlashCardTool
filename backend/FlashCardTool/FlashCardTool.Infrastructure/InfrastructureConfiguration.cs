using FlashCardTool.Application.AiFlashCards;
using FlashCardTool.Domain.Interfaces;
using FlashCardTool.Infrastructure.Ai;
using FlashCardTool.Infrastructure.Auth;
using FlashCardTool.Infrastructure.Persistence;
using FlashCardTool.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlashCardTool.Infrastructure;

public static class InfrastructureConfiguration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<DataHubContext>(options => options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
        services.Configure<AiProviderOptions>(configuration.GetSection(AiProviderOptions.SectionName));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IDeckRepository, DeckRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IFlashCardRepository, FlashCardRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IContentExtractionService, DefaultContentExtractionService>();
        services.AddScoped<IAiFlashcardGenerationService, OpenAiFlashcardGenerationService>();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

        return services;
    }
}
