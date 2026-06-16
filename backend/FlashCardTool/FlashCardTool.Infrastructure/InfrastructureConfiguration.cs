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
        services.AddDbContext<DataHubContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null
                )
            )
        );
        services.Configure<AiProviderOptions>(configuration.GetSection(AiProviderOptions.SectionName));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IDeckRepository, DeckRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IFlashCardRepository, FlashCardRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IContentExtractionService, ContentExtractionService>();
        services.AddScoped<IContentExtractionService, ContentExtractionService>();
        services.AddScoped<IContentExtractor, TextContentExtractor>();
        services.AddScoped<IContentExtractor, PdfContentExtractor>();
        services.AddScoped<IContentExtractor, ImageContentExtractor>();

        services.AddHttpClient<IImageTextExtractionService, OpenAiImageTextExtractionService>();
        services.AddHttpClient<IAiFlashcardGenerationService, OpenAiFlashcardGenerationService>();

        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

        return services;
    }
}
