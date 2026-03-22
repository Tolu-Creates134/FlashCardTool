# FlashCardTool

A cloud-native flashcard learning platform built with React, .NET 9, Docker, and Azure.

## 🌍 Live Demo

Frontend: https://black-ocean-02c9a7803.2.azurestaticapps.net  
Backend API: https://flashcards-api....azurecontainerapps.io/swagger

## ✨ Features

- Google OAuth authentication
- JWT-based authorization
- Role-based access control
- Create, edit and delete decks
- Flashcard tracking & practice sessions
- Cloud deployment with Azure
- CI/CD pipeline via GitHub Actions

## Architecture Overview

- DESIGN AND PLACE HERE

React (Azure Static Web Apps)
        ↓
.NET API (Azure Container Apps, Docker)
        ↓
Azure SQL Database


## 🛠 Tech Stack

#### Frontend:
- React (Create React App)
- Axios
- Google OAuth

#### Backend:
- .NET 9
- Minimal APIs
- Entity Framework Core
- MediatR
- JWT Authentication

#### Cloud:
- Azure Container Apps
- Azure SQL (Serverless)
- Azure Static Web Apps
- Azure Container Registry

## 🔐 Authentication Behaviour (COME BACK TO THIS SECTION TO MAKE SURE IT IS CORRECT)

Authentication is handled using Google OAuth and JWT-based cookies.

### Login Flow

1. User initiates Google sign-in
2. Browser is redirected to backend OAuth endpoint
3. Backend redirects to Google
4. Google returns identity token
5. Backend validates token
6. JWT is generated and stored in a secure HTTP-only cookie

### Session Management

- JWT stored in HTTP-only cookie
- Automatically sent with each request
- No manual token handling in frontend

### Security Considerations

- HTTP-only cookies prevent XSS attacks
- SameSite=None + Secure required for cross-origin requests
- Backend validates all incoming tokens

## ⚠️ Environment Variables

### Frontend (Build-Time Injection)

React applications are static builds, meaning environment variables are injected at build time.

Example:

REACT_APP_API_BASE_URL=https://your-api-url

These values are embedded into the application during:

npm run build

### Why This Matters

- Changing `.env` locally does NOT affect production
- Variables must be configured in:
  - GitHub Actions pipeline
  - Azure Static Web Apps configuration

### Backend (Runtime Configuration)

Backend configuration is handled via:

- Azure Container App environment variables
- Secrets stored securely in Azure

## 🚀 Deployment Strategy

### Backend

- Dockerised .NET API
- Built and pushed to Azure Container Registry
- Deployed to Azure Container Apps
- Secrets configured via Azure

### Database

- Azure SQL Serverless
- Managed via EF Core migrations
- Connection string stored securely

### Frontend

- Hosted on Azure Static Web Apps
- Built via GitHub Actions
- Environment variables injected at build time

## 🔄 CI/CD Pipeline

### Frontend

- Triggered on push to main
- Builds React app
- Deploys to Azure Static Web Apps

### Backend

- Builds Docker image
- Pushes to Azure Container Registry
- Deploys to Azure Container Apps

## 🧠 System Architecture

The backend follows a Clean Architecture approach, separating concerns across distinct layers to improve maintainability, testability, and scalability.

### 🔹 Layer Responsibilities
#### Domain Layer
- Contains core business entities (e.g. Deck, Flashcard, User)
- Defines business rules and invariants
- No dependencies on external frameworks or libraries

#### Application Layer
- Implements business use cases using CQRS (Command Query Responsibility Segregation)
- Uses MediatR to handle commands and queries

Examples:
- CreateDeckCommand
- GenerateFlashcardsCommand

Responsibilities:
- Orchestrates domain logic
- Validates input
- Coordinates between domain and infrastructure

#### Infrastructure Layer
Handles external concerns:
- Database access (Entity Framework Core)
- AI service integration (OpenAI)
- Authentication services

Responsibilities:
- Implements interfaces defined in Application layer
- Keeps external dependencies isolated

#### API Layer
- Defines HTTP endpoints using Minimal APIs
- Handles request/response mapping
- Applies middleware for cross-cutting concerns

Middleware includes:
- Request logging
- Global exception handling
- Status code standardisation

Mention:
Build time vs runtime differences
Why env variables must be injected at build (through the pipeline build) (Ask Chatgpt how the webapp is getting its env variables)

