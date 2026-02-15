# ---------- Build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY FlashCardTool.sln ./
COPY FlashCardTool.API/FlashCardTool.API.csproj FlashCardTool.API/
COPY FlashCardTool.Application/FlashCardTool.Application.csproj FlashCardTool.Application/
COPY FlashCardTool.Domian/FlashCardTool.Domain.csproj FlashCardTool.Domian/
COPY FlashCardTool.Infrastructure/FlashCardTool.Infrastructure.csproj FlashCardTool.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . .

# Publish API project
RUN dotnet publish FlashCardTool.API/FlashCardTool.API.csproj -c Release -o /app/publish

# ---------- Runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "FlashCardTool.API.dll"]
