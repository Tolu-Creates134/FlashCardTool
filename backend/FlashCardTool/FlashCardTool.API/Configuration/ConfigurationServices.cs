using System;
using FlashCardTool.API.Endpoints;

namespace FlashCardTool.API.Configuration;

public static class ConfigurationServices
{
    public static void RegisterAllEndpoints(this WebApplication app)
    {
        DeckEndpoints.DefineEndpoints(app);
        CategoryEndpoints.DefineEndpoints(app);
        // Add other feature endpoints here
    }
}
