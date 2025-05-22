using FlashCardTool.Infrastructure;
using FlashCardTool.Application.Common.Configuration;
using FlashCardTool.API.Endpoints;
using FlashCardTool.API.Configuration;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Application
builder.Services.AddApplication();

// Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.RegisterAllEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(); // ✅ Add this to see Swagger UI
}

app.UseHttpsRedirection();


app.Run();

