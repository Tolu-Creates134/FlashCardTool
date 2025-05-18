using System;
using FlashCardTool.Domain.Interfaces;
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
        services
            .AddDbContext<DataHubContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        _ = services.AddScoped<IDeckRepository, DeckRepository>();
        _ = services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IFlashCardRepository, FlashCardRepository>();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

        return services;
    }
}
