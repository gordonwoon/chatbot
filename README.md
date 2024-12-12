# AI Chat Application

A Next.js-based chat application with AI capabilities, authentication, and MongoDB integration.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 16 or higher)
- MongoDB instance
- npm or yarn package manager

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_nextauth_secret_key
GOOGLE_API_KEY=your_google_ai_api_key
```

For hosted environment variables on vercel:

```bash
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_API_KEY=your_google_ai_api_key
```

## Installation

npm install or yarn install

Open http://localhost:3000 with your browser to see the application.

## Features

User Authentication
Sign up/Sign in functionality
Secure password handling with bcrypt
NextAuth.js integration
Real-time Chat
AI-powered responses using Google's Generative AI
Message history
Modern UI
Responsive design
Loading states
Error handling

## Project Structure

src/
├── actions/ # Server actions
├── app/ # Next.js app router pages
├── components/ # Reusable React components
├── config/ # Configuration files
├── lib/ # Utility functions and libraries
│ ├── auth.ts # Authentication setup
│ ├── mongodb.ts # Database connection
│ └── gemini.ts # AI integration
└── models/ # MongoDB schemas

## API Routes

/api/auth/\* - Authentication endpoints
/api/chat - Chat functionality endpoints

## Technologies Used

Next.js - React framework
MongoDB - Database
NextAuth.js - Authentication
Google Generative AI - AI chat capabilities
TailwindCSS - Styling

## Deployment

The application can be deployed on Vercel:
