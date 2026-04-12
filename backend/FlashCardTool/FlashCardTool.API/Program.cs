using FlashCardTool.Infrastructure;
using FlashCardTool.Application.Common.Configuration;
using FlashCardTool.API.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FlashCardTool.API.Middleware;
using Microsoft.ApplicationInsights;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FlashCardTool API",
        Version = "v1"
    });

    if(!builder.Environment.IsDevelopment())
    {
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Paste your JWT access token here"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    }

});

// Application
builder.Services.AddApplication();

// Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

// Application Insights
builder.Services.AddApplicationInsightsTelemetry();

// Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Cookies["access_token"];

                if (!string.IsNullOrWhiteSpace(accessToken))
                {
                    context.Token = accessToken;
                    return Task.CompletedTask;
                }

                // Fall back to Authorization header — Swagger flow
                var authHeader = context.Request.Headers["Authorization"].ToString();

                if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    context.Token = authHeader.Substring("Bearer ".Length).Trim();
                }

                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(
                "http://localhost:3000",
                "https://black-ocean-02c9a7803.2.azurestaticapps.net",
                "https://www.flash-learn.online"
            )
            .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .WithHeaders("Content-Type", "Authorization")
            .AllowCredentials();
        });
});

WebApplication app = builder.Build();

var telemetry = app.Services.GetRequiredService<TelemetryClient>();

AppDomain.CurrentDomain.UnhandledException += (sender, args) =>
{
    if (args.ExceptionObject is Exception ex)
    {
        telemetry.TrackException(ex);
        telemetry.Flush();
    }
};

// CORS
app.UseCors("AllowFrontend");

// Middleware
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<UnhandledExceptionMiddleware>();
app.UseMiddleware<StatusCodePageMiddleware>();

//Auth
app.UseAuthentication();
app.UseAuthorization();

// Endpoints
app.RegisterAllEndpoints();

//Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(); // ✅ Add this to see Swagger UI
}

if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.Run();
