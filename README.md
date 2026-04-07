# FlashLearn
<img width="1440" height="806" alt="Screenshot 2026-03-24 at 22 09 44" src="https://github.com/user-attachments/assets/219d6555-ea76-4195-a23f-126da009eeb5" />



## 📚 What is FlashLearn?
FlashLearn is a full-stack SaaS study platform built with .NET 9 and React, deployed to Azure with a fully automated CI/CD pipeline.
Users can create AI-powered flashcard decks, track practice sessions, and study smarter — all secured with Google OAuth and JWT authentication.

Built as a personal project to demonstrate production-grade software engineering practices including Clean Architecture, 
CQRS, containerisation, and cloud deployment.

## 🌍 Live Demo

Frontend: https://www.flash-learn.online

Backend API: https://api.flash-learn.online/swagger/index.html

## ✨ Features

- 🤖 AI-powered flashcard generation using OpenAI GPT-4
- 🔐 Google OAuth authentication with JWT cookies
- 📊 Practice session tracking with accuracy scoring
- 🏗️ Clean Architecture with CQRS pattern
- 🐳 Dockerised API deployed to Azure Container Apps
- 🔄 Fully automated CI/CD pipeline via GitHub Actions
- 📈 Application monitoring with Azure Application Insights
- 🗄️ Database migrations automated in pipeline

## Architecture Overview
<img width="1057" height="718" alt="Screenshot 2026-03-27 at 15 44 24" src="https://github.com/user-attachments/assets/aac4552d-f171-4204-99fb-1fbbf7fa8c14" />

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

## 🔐 Authentication Behaviour

This application uses Google Sign-In **only to verify the user's identity**. 
After Google authentication succeeds, the backend issues its own JWT-based 
session. Google is not involved in session management after the initial login.

### Login Flow

1. User clicks "Sign in with Google" on the frontend
2. Google Identity Services returns a Google `idToken` to the frontend
3. Frontend sends that token to `POST /api/auth/google-login`
4. Backend validates the Google token against the configured Google Client ID
5. If valid, the backend creates or updates the user in the local database
6. Backend generates two tokens:
   - A short-lived **JWT access token** (15 minutes)
   - A long-lived **refresh token** (30 days)
7. Both tokens are stored in secure `HttpOnly` cookies
8. Protected API endpoints read the JWT from the `access_token` cookie
9. When the access token expires, the client calls `POST /api/auth/refresh` 
   to rotate and renew both tokens

### JWT Claims

The JWT contains the following application user claims:
- `userId`
- `email`
- `name`
- `picture`

### Session Management

| | Detail |
|---|---|
| Access token lifetime | 15 minutes |
| Refresh token lifetime | 30 days |
| Storage | HttpOnly cookies |
| Token rotation | Yes — both tokens rotated on refresh |

### Security Considerations

- `HttpOnly` cookies prevent JavaScript from accessing tokens, 
   protecting against XSS attacks
- `SameSite=None` + `Secure` required for cross-origin requests 
   between frontend and API
- Google is only used to **prove identity once** — the app manages 
   its own session entirely via JWT
- All protected routes validate the JWT issuer, audience, 
   signature and lifetime on every request
  
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



### 🔮 Future Work
- [ ] PDF and image upload for AI flashcard generation
- [ ] Rate limiting on AI endpoints
- [ ] Unit and integration test coverage
- [ ] Admin dashboard
- [ ] Dark mode


