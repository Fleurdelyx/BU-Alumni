
# System Architecture: BaliuagU Alumni Connect

## 1. Abstract
The BaliuagU Alumni Connect portal is a specialized Graduate Tracer Study (GTS) platform designed to bridge the gap between academic output and industry demands. It utilize a cloud-native architecture to facilitate real-time data collection, alumni networking, and administrative data visualization.

## 2. Multi-Layered Architecture

### 2.1 Presentation Layer (User Interface)
- **Framework:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS for a mobile-first, responsive design.
- **Design Language:** Serif headlines ('Cormorant Garamond') for elegance and Sans-serif body ('PT Sans') for readability.
- **UI Components:** Shadcn UI (Radix UI primitives) for accessible and consistent interactive elements.
- **Data Visualization:** Recharts for real-time statistical rendering of employment distribution and academic trends.

### 2.2 Application Layer (Process Logic)
- **State Management:** React Context API (`AuthProvider`) for global session and profile handling.
- **Routing:** Next.js Client-side routing for seamless navigation.
- **Form Management:** `react-hook-form` with `zod` for multi-step validation of the 31-question GTS form.
- **Sync Logic:** Real-time listeners via Firestore `onSnapshot` ensure the dashboard reflects the latest survey completions immediately.

### 2.3 Business Layer (Intelligence & Validation)
- **AI Integration:** Firebase Genkit utilizing Google Gemini 2.0 Flash. 
    - **BUddy Chatbot:** Grounded with university stats to answer alumni inquiries.
    - **Contextual Assistance:** AI-driven suggestions to help alumni complete complex survey questions accurately.
- **Aggregation Logic:** Algorithms that transform raw NoSQL documents into categorized charts (e.g., employment rates, curriculum relevance scores).

### 2.4 Persistence Layer (Data Access)
- **SDK:** Firebase Client SDK for web (v11).
- **Features:** 
    - **Offline Support:** Local caching allows the tracer study to be completed even with intermittent connectivity.
    - **Optimistic UI:** Updates local state before server confirmation for a zero-latency user experience.
    - **Security Rules:** Server-side rules enforce that alumni can only modify their own responses while administrators have read access to aggregated logs.

### 2.5 Database Layer (Storage)
- **Technology:** Google Cloud Firestore (NoSQL Document Database).
- **Structure:**
    - `/alumni/{uid}`: Primary profiles containing validated GTS metrics.
    - `/alumni/{uid}/questionnaireResponses/{id}`: Sub-collection for historical participation tracking.
    - `/questionnaires/{id}`: Administrative study definitions.
    - `/logs/{id}`: Audit trails for all system mutations.

## 3. Security Implementation
Security is enforced via **Firestore Security Rules** using an Ownership Pattern:
- **Authentication:** All write operations require a valid token.
- **Resource Ownership:** `isOwner(userId)` checks ensure privacy where `request.auth.uid == resource.id`.
- **Administrative Control:** Specific paths like `/logs` and `/questionnaires` are restricted based on authorized claims.
