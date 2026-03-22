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

Frontend:
- React (Create React App)
- Axios
- Google OAuth

Backend:
- .NET 9
- Minimal APIs
- Entity Framework Core
- MediatR
- JWT Authentication

Cloud:
- Azure Container Apps
- Azure SQL (Serverless)
- Azure Static Web Apps
- Azure Container Registry

## 🔐 Authentication Flow

1. User signs in with Google on the frontend.
2. Google returns an ID token.
3. The ID token is sent to the backend.
4. Backend validates the token using GoogleJsonWebSignature.
5. Backend generates a JWT for the user.
6. JWT is used to authorize future requests.

Deployment Strategy

This is your gold section.

Document:
## Backend
- Dockerized
- Built locally
- Pushed to Azure Container Registry
- Deployed to Azure Container Apps
- Secrets configured via Container App secrets

## Database
- Azure SQL Serverless
- EF Core migrations
- Connection string stored as secret

## Frontend
- Azure Static Web Apps
- GitHub Actions CI/CD
- Build-time environment variables
- REACT_APP_* injection

Mention:
Build time vs runtime differences
Why env variables must be injected at build (through the pipeline build) (Ask Chatgpt how the webapp is getting its env variables)

