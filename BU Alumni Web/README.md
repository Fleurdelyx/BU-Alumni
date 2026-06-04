
# BaliuagU Alumni Connect

A specialized Graduate Tracer Study (GTS) portal for Baliuag University alumni, built with Next.js, Firebase, and Genkit AI.

## Features

- **Alumni Dashboard**: Real-time visualization of employment statistics and course relevance.
- **Tracer Study Questionnaire**: Multi-step form for alumni to update their professional status.
- **Alumni Directory**: Searchable database of BU graduates.
- **BUddy Chatbot**: AI-powered assistant grounded with live university data.
- **Admin Panel**: Manage questionnaires, view respondents, and track system logs.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI Integration:** Firebase Genkit with Google Gemini 2.0 Flash
- **Charts:** Recharts

## Getting Started

### Pushing to your GitHub Repository

If you are moving this code from Firebase Studio to your own repository (e.g., `https://github.com/Fleurdelyx/BU-Tracer-Web`), follow these steps:

1. **Locate the Download Button**: Look at the top-right corner of the Firebase Studio interface. Click the **Download Source** button (cloud icon with a down arrow).
2. **Initialize Git locally**:
   Extract the downloaded ZIP file, open your terminal in that folder, and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit from Firebase Studio"
   git branch -M main
   git remote add origin https://github.com/Fleurdelyx/BU-Tracer-Web.git
   git push -u origin main
   ```

### Installation & Local Development

1. **Clone your repository:**
   ```bash
   git clone https://github.com/Fleurdelyx/BU-Tracer-Web.git
   cd BU-Tracer-Web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   ```

4. **Firebase Configuration:**
   Your Firebase configuration is stored in `src/firebase/config.ts`. If you move to a different project, update those values.

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## Mobile App Integration (Flutter)

This web application shares a backend that is fully compatible with Flutter. To build a mobile app:
1. Create a new Flutter project.
2. Use the same Firebase Project ID (`studio-8351558177-9c67c`).
3. Follow the schema in `docs/backend.json` to ensure your Flutter data models match the Firestore structure used here.
4. **Data Sync**: Since both apps use the same Firestore database, any updates made in the Flutter app will reflect instantly in the web dashboard and vice versa.

---
© 2026 Baliuag University. All rights reserved.
