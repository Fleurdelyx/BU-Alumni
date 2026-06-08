# ALUMNI: A Web and Mobile Tracer Study Platform for Baliuag University

An Undergraduate Capstone Project
Presented to the Faculty of the
College of Information Technology Education
Baliuag University
City of Baliwag, Bulacan
In Partial Fulfillment of the
Requirements for the Degree
BACHELOR OF SCIENCE IN COMPUTER SCIENCE
by
Researcher 1
Researcher 2
May 2026

---

# Table of Contents

- [Chapter I — Introduction](#chapter-i--introduction)
  - [The Problem and Its Background](#the-problem-and-its-background)
  - [Significance of the Study](#significance-of-the-study)
  - [Review of Related Literature and Studies](#review-of-related-literature-and-studies)
  - [Project Context](#project-context)
  - [Statement of the Problem](#statement-of-the-problem)
  - [Objectives of the Study](#objectives-of-the-study)
  - [Scope and Limitations of the Study](#scope-and-limitations-of-the-study)
  - [Definition of Terms](#definition-of-terms)
  - [Framework of the Study](#framework-of-the-study)
  - [Technical Background](#technical-background)
- [Chapter II — Method](#chapter-ii--method)
  - [Research Subject](#research-subject)
  - [Research Instrument](#research-instrument)
  - [System Development Methodology](#system-development-methodology)
  - [Requirement Specification and Analysis](#requirement-specification-and-analysis)
  - [Existing System](#existing-system)
  - [Designing](#designing)
  - [Responsibilities](#responsibilities)
  - [Implementation Plan](#implementation-plan)
  - [System Requirements](#system-requirements)
  - [Verification, Validation, and Testing](#verification-validation-and-testing)
  - [Data Analysis](#data-analysis)
- [Chapter III — Implementation](#chapter-iii--implementation)
  - [System Overview](#system-overview)
  - [Web Portal Implementation](#web-portal-implementation)
  - [Admin Portal Implementation](#admin-portal-implementation)
  - [Mobile Application Implementation](#mobile-application-implementation)
  - [Key Features Demonstration](#key-features-demonstration)
- [Chapter IV — Evaluation and Results](#chapter-iv--evaluation-and-results)
  - [Evaluation Framework](#evaluation-framework)
  - [Data Analysis Procedures](#data-analysis-procedures)
  - [Expected Results](#expected-results)
- [References](#references)

---

# Chapter I — Introduction

## The Problem and Its Background

In the current educational landscape, higher education institutions are expected to produce graduates who are equipped with the knowledge, skills, and competencies required to meet the demands of the labor market (UNESCO, 2021). As industries continue to evolve due to technological advancements and global competition, universities are increasingly required to ensure that their academic programs remain relevant and aligned with workforce needs (International Labour Organization, 2022). One effective way of evaluating this alignment is through a graduate tracer study, which systematically tracks graduates after completing their degree to assess their employment outcomes and career progression (European Commission, 2020).

Graduate tracer studies provide valuable insights into the employability of graduates, including their employment status, job relevance, and the applicability of the skills they acquired during their academic training (Abana et al., 2021). These studies also serve as a feedback mechanism that enables institutions to evaluate the effectiveness of their curriculum and instructional practices (Sarsale et al., 2024).

In the Philippines, the Commission on Higher Education (CHED) has institutionalized the Graduate Tracer Study (GTS) as a standard tool for monitoring graduate outcomes and supporting quality assurance in higher education. Universities such as Baliuag University adopt and localize this framework to systematically gather data on their graduates and guide program improvement (Dela Cruz, 2022).

Despite the availability of standardized tracer study frameworks, several challenges are still encountered in their implementation. Many institutions continue to rely on manual or traditional methods of data collection, which often result in low response rates, delayed data processing, and difficulties in organizing and analyzing large volumes of data (Bensi et al., 2024). In addition, recent studies have shown that although graduates are generally employable, issues such as job mismatch, skills gaps, and limited tracking of long-term career development persist (Guzman & Maling, 2026). These challenges create a gap between the availability of tracer study frameworks and the effective utilization of graduate data for institutional decision-making.

With these limitations, there is a need for a more efficient and technology-driven approach to conducting graduate tracer studies. The use of digital systems, particularly integrated web and mobile-based platforms, can improve data collection by providing easier access for respondents and faster processing of responses (Nonyelum, 2020). Moreover, integrating data analytics, real-time collaboration features, and automated reporting capabilities can enhance the interpretation of results and support timely and evidence-based decision-making within academic institutions (Sarsale et al., 2024).

Furthermore, the integration of artificial intelligence in educational systems has opened new opportunities for enhancing user interaction and data processing. According to UNESCO (2021), AI technologies can support personalized user experiences and improve access to educational services. The OECD (2019) also emphasized that digital transformation, including the use of intelligent systems, can strengthen data-driven decision-making in education. These innovations are relevant in the context of tracer studies, as they can facilitate automated responses, improve user engagement, and streamline the overall process of data collection and analysis.

In the context of Baliuag University, there is a need to improve the process of tracing graduates from 2019 to 2023 through a more systematic and technology-supported approach that aligns with both the CHED Graduate Tracer Study and the university's existing tracer practices. While the university offers a wide range of academic programs, there is limited consolidated and digitally managed data regarding the employment outcomes, job relevance, and professional experiences of its graduates. This lack of organized information makes it difficult for administrators and faculty members to effectively assess program outcomes and identify areas for curriculum enhancement (Pallo & Pallo, 2023).

Therefore, this study proposes the development of an integrated graduate tracer system that combines a web portal, a dedicated admin portal, and a mobile application, all connected to a unified Supabase backend. The system integrates the CHED Graduate Tracer Study framework with Baliuag University's tracer process to provide a more efficient, accessible, and data-driven approach to graduate tracking. The proposed system aims to facilitate easier participation among graduates, improve data accuracy, enable real-time alumni engagement through a community forum, and generate timely reports that can support curriculum development and institutional planning.

## Significance of the Study

This study provides contributions to various stakeholders:

**University Administration.** The system enables real-time access to organized graduate data through an admin dashboard with analytics, charts, and exportable reports for informed decision-making, curriculum enhancement, and accreditation.

**Office of Alumni Affairs.** The platform improves alumni tracking through centralized digital record management and provides a forum for continued alumni engagement and networking.

**Faculty and Colleges.** The findings provide insights into employability trends, curriculum relevance, and skills gaps across different degree programs and graduation cohorts.

**Graduates.** The system offers a convenient multi-platform experience for participation and continued engagement with the university through the web portal or mobile application.

**Students.** The results guide career opportunities and in-demand competencies based on actual graduate employment outcomes.

**Baliuag University.** Overall, the system strengthens institutional data management, quality assurance, alumni relations, and community building through an integrated digital platform.

## Review of Related Literature and Studies

Graduate tracer studies are widely utilized by higher education institutions to evaluate the effectiveness of academic programs in preparing students for employment and career development. These studies focus on key indicators such as employment status, job relevance, skills utilization, and alignment between educational preparation and labor market demands, making them essential tools for quality assurance and institutional improvement (Harvey, 2001; Yorke, 2006). In recent years, tracer studies have evolved from simple employment tracking into comprehensive systems that support evidence-based decision-making in higher education.

In the Philippine context, tracer studies are commonly conducted to assess graduate outcomes and inform curriculum enhancement. Several studies highlight the relationship between acquired competencies and employability across different academic disciplines. For instance, Ramel (2025) found that business-related competencies significantly influenced the employability of BSBA graduates, particularly in financial management and marketing roles. Similarly, Abana et al. (2021) reported that pedagogical competencies and licensure preparation contributed to the employment success of education graduates. Cornillez et al. (2021) further emphasized that curriculum alignment with licensure requirements and industry expectations plays a critical role in graduate employability. In the field of information technology, Bensi et al. (2024) identified that technical skills aligned with current industry standards significantly improved employment opportunities among graduates.

Additional local studies reinforce the importance of tracer studies as a basis for curriculum development and institutional planning. Torrejas and Ordaneza (2025) revealed that marketing management graduates benefited from industry exposure and practical training, which enhanced their employability. Likewise, Pallo and Pallo (2023) found that engineering graduates who possessed both technical and soft skills were more likely to achieve higher job level positions. Valdez and Argel (2025) also highlighted that managerial and entrepreneurial competency influenced career progression among cooperative management graduates. Across these studies, common themes such as job relevance, employment rate, and skills applicability consistently emerged, demonstrating that tracer studies provide actionable insights for improving academic programs.

On an international scale, tracer studies serve as standardized mechanisms for evaluating graduate employability and higher education outcomes. The European Commission (2020) introduced a structured framework for graduate tracking, emphasizing the importance of comparable and reliable data across institutions. Similarly, Guzman and Maling (2025) examined graduate employability and career pathways and found that industry alignment and competency development are key determinants of employment outcomes. The International Labour Organization (2022) also reported that monitoring youth employment trends is essential for understanding labor market dynamics and guiding education policies. These studies highlight the global relevance of tracer studies in bridging the gap between education and employment.

With the advancement of technology, the implementation of digital solutions in tracer studies has become increasingly important. Traditional data collection methods often result in low response rates and inefficient data management, prompting the need for more accessible and automated systems. Nonyelum (2020) emphasized that digital platforms improve data collection efficiency and system usability through iterative and user-centered design. Furthermore, Sarsale et al. (2024) noted that integrating data analytics enhances the interpretation of tracer study results, allowing institutions to generate more meaningful insights. These findings suggest that technology plays a crucial role in improving the overall effectiveness of tracer studies.

Moreover, the integration of artificial intelligence in educational systems has opened new opportunities for enhancing user interaction and data processing. According to UNESCO (2021), AI technologies can support personalized user experiences and improve access to educational services. The OECD (2019) also emphasized that digital transformation, including the use of intelligent systems, can strengthen data-driven decision-making in education. These innovations are relevant in the context of tracer studies, as they can facilitate automated responses, improve user engagement, and streamline the overall process of data collection and analysis.

Overall, the reviewed literature demonstrates that graduate tracer studies are essential tools for evaluating program effectiveness, improving curriculum relevance, and ensuring alignment between education and labor market demands. While traditional tracer methods provide valuable insights, they are often limited by inefficiencies in data collection and analysis. The integration of digital technologies, multi-platform accessibility, real-time collaboration features, and intelligent systems addresses these limitations by enhancing the accessibility, accuracy, and timeliness of data. Therefore, the proposed system builds upon existing tracer study frameworks by incorporating web, mobile, and administrative portals with a unified backend to improve the efficiency and effectiveness of graduate tracking processes.

## Project Context

The ALUMNI system enhances Baliuag University's operations in managing alumni data, conducting tracer studies, analyzing graduate employment outcomes, and fostering alumni community engagement.

### Purpose and Description

The project aims to provide a flexible, integrated web and mobile-based tracer study system that simplifies data collection, improves alumni engagement, assists administrators in managing records efficiently, and enables comprehensive data analytics that generate insights into graduate employability, program relevance, and institutional performance. The system consists of three interconnected applications:

1. **BU Alumni Web** — A Next.js 15 web portal for graduates to complete tracer surveys, participate in the alumni forum, browse the directory, and manage their profiles.
2. **BU Alumni Admin** — A separate Next.js 15 administrative portal for university staff to manage respondents, view analytics, moderate the forum, manage user accounts, and configure system settings.
3. **BU Alumni Mobile** — A Flutter cross-platform mobile application providing graduates with on-the-go access to surveys, forum discussions, directory search, and profile management.

All three applications share a single Supabase backend, ensuring data consistency, real-time synchronization, and unified authentication.

## Statement of the Problem

This study aims to develop and evaluate an integrated web and mobile-based alumni tracer study system for Baliuag University. Specifically, it seeks to answer the following:

### Tracer Study

1. What is the employment status of the graduates?
2. How long does it take for graduates to obtain their first job?
3. What is the nature of their employment?
4. How relevant is their degree program to their current job?
5. What skills and competencies are most useful in their employment?

### System Evaluation (ISO/IEC 25010)

6. How acceptable is the system in terms of:
   - Functional Suitability
   - Performance Efficiency
   - Compatibility
   - Usability
   - Reliability
   - Security
   - Maintainability
   - Flexibility

### User Evaluation

7. How do users evaluate the system using the System Usability Scale (SUS)?

## Objectives of the Study

### General Objective

To develop and evaluate an integrated web and mobile-based alumni tracer study platform for Baliuag University.

### Specific Objectives

Specifically, this study aims to:

1. Determine the employment status of the graduates.
2. Identify the length of time it took the graduates to obtain their first job after graduation.
3. Describe the nature of employment of the graduates in terms of job position and employment status.
4. Assess the relevance of the degree program to the graduates' current occupation.
5. Distinguish the skills and competencies acquired in college that are most applicable to their present work.
6. Evaluate the system quality of the web portal, admin portal, and mobile application using ISO/IEC 25010.
7. Assess the usability of all three platform components using the System Usability Scale (SUS).

## Scope and Limitations of the Study

This study traces the employment outcomes and professional experiences of graduates from Baliuag University who completed their degrees between 2019 to 2023. It focuses on key aspects such as employment status, length of time spent securing first employment, nature of current job, relevance of degree to current work, and the skills and competencies that graduates find most applicable to their professional responsibilities.

The respondents of this study are graduates from selected programs offered by the University, including but not limited to business administration and information technology, depending on the availability of respondents who voluntarily completed the online questionnaire through the web portal or mobile application.

This research is limited to the information provided by graduates through the tracer study questionnaire. It does not incorporate employer evaluations, salary analysis, longitudinal tracking beyond the point of data collection, or an in-depth study of labor market conditions that may influence employment outcomes. It also does not measure career progression beyond the initial period after graduation.

Furthermore, the generalizability of the findings is limited to the graduates who responded within the data collection period. The results reflect only the experiences and perceptions of respondents who participated in the study and may not represent all graduates from Baliuag University within the covered years.

## Definition of Terms

**Alumni Tracer Study.** A systematic method of collecting information from graduates regarding their employment status, career progression, and the relevance of their education to their current occupation.

**BU Alumni Web.** The Next.js 15 web portal that serves as the primary access point for graduates to complete tracer surveys, participate in forum discussions, and manage their alumni profiles.

**BU Alumni Admin.** The separate Next.js 15 administrative portal used by university staff to manage user accounts, view analytics, moderate forum content, and export respondent data.

**BU Alumni Mobile.** The Flutter cross-platform mobile application that provides graduates with mobile access to tracer surveys, forum discussions, directory search, and profile management.

**BUddy AI Chatbot.** An artificial intelligence-powered assistant integrated into all three platform components. BUddy is powered by Google Gemini 2.0 Flash and deployed as a Supabase Edge Function, providing navigation assistance and responding to user queries about the tracer study.

**Supabase.** An open-source Firebase alternative that provides a PostgreSQL database, authentication, storage, real-time subscriptions, and edge functions as a unified backend platform.

**Row-Level Security (RLS).** A PostgreSQL feature used to enforce fine-grained access control policies at the database level, ensuring users can only access data they are authorized to view or modify.

**Supabase Edge Function.** A serverless function deployed on the Supabase platform that executes server-side logic, such as AI chatbot responses, notification creation, CSV export, and audit logging.

**Real-time Subscription.** A WebSocket-based feature provided by Supabase that enables live updates across all connected clients when database changes occur, used for forum replies and notifications.

**Two-Factor Authentication (2FA).** An additional security layer requiring users to provide two forms of identification before accessing the system. The admin portal enforces TOTP-based 2FA using authenticator applications.

**Time-based One-Time Password (TOTP).** A temporary passcode generated by an algorithm that uses the current time of day as one of its factors, used for two-factor authentication in the admin portal.

**Flutter.** An open-source UI software development kit created by Google for building natively compiled cross-platform applications from a single codebase.

**Next.js.** A React framework developed by Vercel that enables server-side rendering, static site generation, and API routes for building production-ready web applications.

**Riverpod.** A reactive state management library for Flutter applications that provides efficient data handling and dependency injection.

**Graduate Employability.** The ability of graduates to obtain and maintain employment, utilizing the knowledge and skills acquired during their academic training.

## Framework of the Study

This study utilizes the Input-Process-Output (IPO) framework to illustrate the systematic flow of the alumni tracer study system. The framework provides a structured approach to understanding how inputs are transformed through various processes to produce desired outputs.

**Inputs.** The inputs consist of graduate demographic data, educational background, employment information, skills and competencies data, and user interactions such as forum posts and replies. These inputs are collected through the web portal, mobile application, and administrative configurations.

**Process.** The processing layer involves data validation, secure authentication, survey data storage, real-time forum synchronization, AI-powered chatbot interactions, analytics aggregation, and administrative moderation workflows. All processing occurs on the unified Supabase backend with Row-Level Security policies.

**Outputs.** The outputs include employment statistics and visualizations, curriculum relevance reports, skills gap analyses, forum discussions and community engagement metrics, administrative dashboards with analytics, and exported CSV datasets for institutional reporting.

## Technical Background

The BU Alumni Tracer Study platform is built using modern, scalable technologies across three client applications and a unified backend. The system architecture follows a client-server pattern with clear separation of concerns between presentation, business logic, and data layers.

### Web Portal (BU Alumni Web)

The web portal is developed using Next.js 15 with the App Router, providing server-side rendering capabilities and optimized performance. React 19.2.1 serves as the UI library with TypeScript 5 for type safety. Tailwind CSS 3.4.1 provides utility-first styling aligned with the Baliuag University brand identity. Shadcn UI and Radix UI primitives form the component foundation, ensuring accessible and consistent interface elements.

Forms are managed using React Hook Form with Zod validation. Recharts renders analytics visualizations on the dashboard. Next-themes enables dark and light mode toggling. The portal connects to Supabase using the JS Client v2 with `@supabase/ssr` for cookie-based authentication session management.

### Admin Portal (BU Alumni Admin)

The admin portal is a completely separate Next.js 15 application deployed independently from the alumni web portal. This separation ensures that administrative code and service-role key access are never exposed to alumni users. The admin portal enforces two-factor authentication (TOTP) for all administrative accounts through Supabase MFA.

The admin interface includes dashboard analytics, respondent management tables with CSV export, forum moderation queues, user account controls, and system settings. It uses the same design system as the web portal (Tailwind CSS, Shadcn UI, Recharts) for consistency while maintaining distinct branding as the "ADMIN Portal."

### Mobile Application (BU Alumni Mobile)

The mobile application is developed using Flutter 3.22+ with Dart 3.4+, enabling deployment on Android and iOS from a single codebase. Material Design 3 provides the UI component system for consistent and modern interface elements. State management is handled through Flutter Riverpod 2, which provides reactive capabilities including StreamProvider and StateNotifierProvider for efficient data flow.

GoRouter manages declarative routing across all screens. SharedPreferences is utilized for local persistent storage of user preferences such as theme settings. The application connects to the shared Supabase backend using `supabase_flutter` for authentication, database queries, real-time subscriptions, and file storage.

### Backend Infrastructure

The backend infrastructure is powered by Supabase, an open-source Firebase alternative built on PostgreSQL. The platform provides:

- **PostgreSQL 16 Database** — Relational data storage with full SQL support, JOINs, aggregations, and complex queries.
- **Authentication** — Email/password authentication with optional OAuth providers (Google, Microsoft), plus TOTP-based multi-factor authentication for admin accounts.
- **Storage** — S3-compatible object storage for avatar images and file attachments.
- **Realtime** — WebSocket-based live subscriptions for forum reply updates and notification delivery.
- **Edge Functions** — Serverless TypeScript functions running on Deno for server-side logic.

All database tables have Row-Level Security (RLS) enabled, enforcing ownership-based access control at the database level. This ensures users can only access their own survey responses, while administrators can access aggregated data for reporting.

### AI Integration

The BUddy AI chatbot is powered by Google Gemini 2.0 Flash and deployed as a Supabase Edge Function (`buddy-chat/index.ts`). This server-side deployment ensures the API key is never exposed to client applications. BUddy provides intelligent navigation assistance, answers to frequently asked questions about the tracer study, and personalized guidance throughout the survey completion process. The chatbot is accessible from all three platform components.

### Data Visualization

The web and admin portals use Recharts for rendering responsive line charts, bar charts, donut charts, and area charts that visualize employment statistics, response timelines, and demographic distributions. The mobile application uses FL Chart for rendering bar and pie charts that visualize employment statistics, course distribution, and job-field analysis.

### Security Implementation

Security is implemented through multiple layers:

- **Database Level:** Row-Level Security (RLS) policies enforce user-based access control on all tables.
- **Authentication Level:** Password requirements include minimum 8 characters, uppercase, lowercase, number, and special character. Admin accounts require TOTP-based 2FA.
- **Transport Level:** All Supabase connections are encrypted using SSL/TLS protocols.
- **Application Level:** Environment variables manage API keys securely. The admin portal uses a separate service-role key with elevated privileges.
- **Audit Level:** An `audit_logs` table tracks administrative actions, authentication events, and system changes for compliance review.
- **Forum Moderation:** A `forum_reports` table enables users to flag inappropriate content, which enters a moderation queue for administrator review.


---

# Chapter II — Method

This chapter covers the methods used in designing the system, the architecture pattern applied, the software development cycle utilized, workflows for the existing and proposed system, and the software technology stack employed in developing the system. The system was created from scratch and designed to be flexible to the needs of the intended users.

## Research Subject

The respondents of this study are graduates of Baliuag University who completed their degrees between academic years 2019 to 2023. The distribution of respondents is determined according to the availability of contact information and willingness to participate in the tracer study through the web portal or mobile application.

The target population includes graduates from various colleges within the university, including but not limited to:

- College of Business Administration and Accountancy
- College of Education and Human Development
- College of Hospitality Management and Tourism
- College of Information Technology Education
- College of Liberal Arts and General Education
- College of Nursing and Allied Health Science

Purposive sampling is employed to ensure representation across different degree programs and graduation years. The minimum target sample size is determined using statistical formulas to ensure adequate power for analysis.

## Research Instrument

The study utilizes the standardized Graduate Tracer Study (GTS) questionnaire prescribed by the Commission on Higher Education (CHED) and adapted from Baliuag University's existing GTS instrument. The questionnaire is divided into several sections:

### Section A: Demographic Profile
- Personal information (name, contact details, year graduated)
- Degree program and major
- Additional credentials or certifications obtained
- Permanent address, civil status, sex, date of birth
- Region of origin, province, and location type

### Section B: Educational Background
- Degree and specialization
- College or university attended
- Year graduated and honors received
- Professional examinations taken
- Reasons for taking the course

### Section C: Trainings and Advanced Studies
- Title of training or advanced study
- Duration and credits earned
- Name of training institution

### Section D: Employment Data
- Current employment status
- Employment type and occupation
- Major line of business and place of work
- First job details and duration
- Reasons for staying or changing jobs
- Job level (first and current)
- Initial monthly earnings
- Curriculum relevance

### Section E: Skills and Competencies
- Useful competencies in current employment
- Suggestions for curriculum improvement
- Peer referrals

## System Development Methodology

The Iterative and Incremental Development (IID) methodology is used as a guide to develop the project. With the project processes being broken down into manageable parts as increments and systematically repeating the cycle for iteration, the project is flexible enough for requirements or designs to be changed in the course of development (Larman & Basili, 2003; Ibrahim, 2020).

Each phase of the cycle is used for iteration to improve each deployment of the software. The phases are: Planning and Requirements Gathering, Analysis and Design, Implementation, Testing, Evaluation, and Deployment.

### Planning and Requirements Gathering

This phase involves initial discussions with stakeholders, including university administrators, faculty members, and alumni representatives. The requirements for the tracer study system are identified, including functional requirements (questionnaire system, data visualization, AI assistant, forum, directory, admin moderation) and non-functional requirements (security, performance, usability, scalability).

### Analysis and Design

The system is designed according to the identified requirements and the limits of the software technology stack. The main functionalities include:

- User Authentication and Account Management
- Dynamic Questionnaire System (CHED GTS 5-step)
- Alumni Directory with Search and Filtering
- Alumni Forum with Real-Time Discussions
- Statistics Dashboard with Data Visualization
- AI Chatbot (BUddy) for User Assistance
- Admin Portal for Moderation and Analytics
- Notification System with Real-Time Delivery
- Theme and Preference Management

### Implementation

Each functionality is modular and implemented separately while also being cohesive with others. The implementation follows clean architecture principles with clear separation between presentation, domain, and data layers. Three client applications are developed in parallel against the unified Supabase backend.

### Testing

Each functionality has its own unit testing, regression, and sanity tests. The overall cohesion of the functionalities is also tested after all functions are completed. Testing includes functional testing, usability testing, security testing, and cross-platform compatibility testing.

### Evaluation

After all tests are completed, the evaluation is executed to determine efficiency and validity. Two evaluations are conducted: a technical evaluation using ISO/IEC 25010 standards and a user evaluation using the System Usability Scale (SUS).

### Deployment

The final iteration of the system is deployed to production environments. The web and admin portals are deployed to Vercel, while the mobile application is distributed through application stores. CI/CD pipelines using GitHub Actions automate the build and release process.

## Requirement Specification and Analysis

The final requirement specification and overall analysis for the application depend on the project's final output. The system proposition is based on initial discussions with stakeholders and is subsequently refined based on further specifications and feedback.

### Functional Requirements

- The system shall allow users to register and authenticate using email and password or OAuth providers.
- The system shall provide a multi-section CHED-aligned questionnaire for data collection with auto-save draft functionality.
- The system shall display statistics through interactive charts and graphs on both web and mobile platforms.
- The system shall provide an AI chatbot for user assistance across all three platform components.
- The system shall support an alumni forum with categories, threads, replies, reactions, bookmarks, and real-time updates.
- The system shall provide an alumni directory with search, filtering, and profile viewing capabilities.
- The system shall deliver real-time notifications for forum replies, reactions, mentions, and system announcements.
- The system shall provide an admin portal with user management, forum moderation, analytics dashboards, and CSV export.
- The system shall support dark and light mode themes on all client applications.
- The system shall enforce two-factor authentication for administrative accounts.

### Non-Functional Requirements

- The system shall respond to user actions within 2 seconds.
- The system shall encrypt all data in transit and at rest.
- The system shall be available 99.5% of the time.
- The system shall comply with data privacy regulations.
- The system shall support concurrent access by at least 1,000 users.
- The system shall be accessible on modern web browsers and Android 8.0+ devices.

## Existing System

The current process for conducting alumni tracer studies at Baliuag University involves manual distribution of paper-based questionnaires or email surveys. The workflow of the existing system is as follows:

1. The Office of the Registrar provides a list of graduates and their contact information.
2. Questionnaires are prepared in printed form or as email attachments.
3. Surveys are distributed through mail, email, or during alumni events.
4. Completed questionnaires are collected and manually encoded into spreadsheets.
5. Data is processed and analyzed using spreadsheet software.
6. Reports are generated and presented to stakeholders.

The existing system has several limitations:

- Low response rates due to the inconvenience of paper-based or email surveys.
- Time-consuming manual data encoding process.
- Difficulty in tracking and following up non-respondents.
- Limited data visualization capabilities.
- No real-time access to collected data.
- No centralized platform for alumni community engagement.
- No administrative dashboard for monitoring response rates and viewing analytics.

## Designing

### System Architecture

The system follows a unified backend architecture where three client applications — the web portal, admin portal, and mobile application — communicate with a single Supabase backend instance. This design ensures data consistency, eliminates duplication, and simplifies maintenance.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Web Portal  │  │ Admin Portal │  │  Mobile App      │  │
│  │  (Next.js 15)│  │  (Next.js 15)│  │  (Flutter 3.22+) │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼────────────┘
          │                 │                   │
          └─────────────────┼───────────────────┘
                            │ HTTPS / WebSocket
          ┌─────────────────┴───────────────────┐
          │           Supabase Backend           │
          │  ┌───────────────────────────────┐  │
          │  │  PostgreSQL 16 Database       │  │
          │  │  ├── Auth (users, profiles)   │  │
          │  │  ├── GTS (responses, sections)│  │
          │  │  ├── Forum (threads, replies) │  │
          │  │  ├── Analytics (mv_employment)│  │
          │  │  └── Audit (logs, reports)    │  │
          │  └───────────────────────────────┘  │
          │  ┌───────────────────────────────┐  │
          │  │  Supabase Services            │  │
          │  │  ├── Auth (Email, OAuth, MFA) │  │
          │  │  ├── Storage (Avatars, Files) │  │
          │  │  ├── Realtime (WebSocket)     │  │
          │  │  └── Edge Functions (Deno)    │  │
          │  └───────────────────────────────┘  │
          └─────────────────────────────────────┘
```

### Database Design

The database is designed as a relational PostgreSQL schema with the following core entity groups:

**Authentication and Profiles.** The `profiles` table extends Supabase Auth's `auth.users` with alumni-specific fields including name (first, middle, last), avatar URL, role (alumni/admin/moderator), bio, batch year, degree, and college. A trigger automatically creates a profile row upon user registration.

**Graduate Tracer Study Data.** The GTS data model uses a main `gts_responses` table linked to sub-tables for each section: `gts_section_a` (general information), `gts_degrees` and `gts_prof_exams` (educational background), `gts_course_reasons` (reasons for taking the course), `gts_trainings` (advanced studies), `gts_employment` (employment data), and `gts_skills_feedback` (competencies and suggestions).

**Forum and Community.** The forum schema includes `forum_categories` (7 seeded categories), `forum_threads` (with full-text search vector), `forum_replies` (with optional parent threading), `forum_reactions` (emoji reactions on threads and replies), and `forum_bookmarks` (user-saved threads).

**Notifications and Moderation.** The `notifications` table stores real-time alerts for recipients. The `audit_logs` table tracks administrative actions with actor metadata. The `forum_reports` table enables content moderation workflows.

**Analytics.** The materialized view `mv_employment_stats` aggregates employment data by batch year, degree, and college, refreshed nightly via pg_cron.

### Design Patterns

The following design patterns are utilized in the system:

- **Repository Pattern** — Abstracts data access and provides a clean API for data operations across all three client applications.
- **Provider Pattern** — Manages state and dependency injection through Riverpod (mobile) and React hooks (web).
- **Observer Pattern** — Enables reactive UI updates through Supabase Realtime streams and Firestore-like subscriptions.
- **Model-View-ViewModel (MVVM)** — Separates UI logic from business logic in the mobile application.
- **Factory Pattern** — Creates widgets and components dynamically based on configuration.
- **Serverless Function Pattern** — Encapsulates server-side logic in stateless Edge Functions for scalability.

## Software Development Tools

The following technology stack was chosen for the development of the platform:

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Web Frontend** | Next.js 15 | React framework with App Router |
| | React 19.2.1 | UI component library |
| | TypeScript 5 | Static typing |
| | Tailwind CSS 3.4.1 | Utility-first styling |
| | Shadcn UI + Radix UI | Accessible component primitives |
| | Recharts | Analytics charts and visualizations |
| **Admin Frontend** | Next.js 15 | Separate admin application |
| | Tailwind CSS + Shadcn UI | Consistent design system |
| | Recharts | Admin analytics dashboards |
| **Mobile Frontend** | Flutter 3.22+ | Cross-platform mobile framework |
| | Dart 3.4+ | Programming language |
| | Material Design 3 | UI component system |
| | GoRouter | Declarative routing |
| | Flutter Riverpod 2 | Reactive state management |
| | FL Chart | Bar and pie chart rendering |
| **Backend** | Supabase | Unified backend platform |
| | PostgreSQL 16 | Relational database |
| | Supabase Auth | Authentication and MFA |
| | Supabase Storage | File and avatar storage |
| | Supabase Realtime | Live WebSocket subscriptions |
| | Supabase Edge Functions | Serverless logic (Deno) |
| **AI/ML** | Google Gemini 2.0 Flash | BUddy chatbot intelligence |
| **CI/CD** | GitHub Actions | Automated build and deployment |
| **Version Control** | Git and GitHub | Source code management |

## Responsibilities

In the development of the BU Alumni Tracer Study platform, the researchers are tasked with performing the following roles to ensure the success of the system:

**Software Architect.** Creates the appropriate technology stacks and orchestrates the overall design of the system based on the needs of the stakeholders, ensuring the three-client architecture integrates seamlessly with the unified Supabase backend.

**Software Developer.** Develops the system based on the design and executes the necessary technical decisions for the overall coding aspects across the web portal, admin portal, and mobile application.

**Quality Assurance.** Performs sanity testing, develops test cases, conducts regression testing, and evaluates UI touch and feel across all three platform components.

**Software Trainer.** Responsible for training the users of the proposed system and providing a comprehensive user guide covering the web portal, admin portal, and mobile application.

## Implementation Plan

The following procedure details the overall plan for deployment and implementation of the platform:

| Strategy | Activity | Persons Involved | Duration |
|----------|----------|-----------------|----------|
| Agreement Discussion | Discuss system use, limitations, and data privacy | Admin, Researcher | 1 Day |
| Backend Setup | Configure Supabase project, database schema, RLS policies, Edge Functions | Researcher | 3 Days |
| Web Portal Deployment | Build and deploy Next.js web app to Vercel | Researcher | 2 Days |
| Admin Portal Deployment | Build and deploy separate Next.js admin app | Researcher | 2 Days |
| Mobile App Deployment | Build release APK and prepare app store listing | Researcher | 2 Days |
| User Training | Demonstration, manual provision, Q&A for web and mobile | Admin, Researcher | 2 Days |
| Data Collection | Survey distribution and response gathering | Graduates | 4 Weeks |
| Analysis & Reporting | Data processing and report generation | Researcher | 1 Week |

## System Requirements

The following table shows the minimum requirements for the hardware and software necessary to run the platform:

### Web Portal and Admin Portal

| Item | Minimum Requirements |
|------|---------------------|
| Processor | 1.5 GHz or above, Dual Core |
| RAM | 4 GB |
| Storage | 500 MB free space |
| Operating System | Windows 10+, macOS 10.15+, or Linux |
| Internet | Broadband connection (2 Mbps+) |
| Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Display | 1280 x 720 resolution |

### Mobile Application

| Item | Minimum Requirements |
|------|---------------------|
| Processor | 1.5 GHz or above, Dual Core |
| RAM | 3 GB (Android), 2 GB (iOS) |
| Storage | 100 MB free space |
| Operating System | Android 8.0+ or iOS 13+ |
| Internet | Required for sync and AI features |
| Display | 4.7 inches or larger |

## Verification, Validation, and Testing

In compliance with the ISO/IEC 25010 software product quality model, the researchers conduct comprehensive testing and evaluation of the system. The quality model comprises nine main quality characteristics:

### Functional Suitability

Measures the degree to which the system provides functions that satisfy the implied needs of the user. Sub-characteristics include functional completeness, functional correctness, and functional appropriateness.

### Performance Efficiency

Measures the software's performance within set time and throughput parameters. Sub-characteristics include time behavior, resource utilization, and capacity.

### Compatibility

Measures the software's ability to interact with other software and perform with other systems in the same environment. Sub-characteristics include co-existence and interoperability.

### Interaction Capability (Usability)

Measures the software's capability to interact and complete specified user objectives. Sub-characteristics include learnability, operability, user error protection, and user engagement.

### Reliability

Measures the software's ability to perform specified functions under specified conditions over time. Sub-characteristics include faultlessness, availability, fault tolerance, and recoverability.

### Security

Measures the software's capability to defend against attacks, protect data, and ensure appropriate user access. Sub-characteristics include confidentiality, integrity, non-repudiation, and authenticity.

### Maintainability

Represents the software's ability for efficient and effective modification, improvement, and adaptation. Sub-characteristics include modularity, reusability, analyzability, modifiability, and testability.

### Flexibility

Measures the software's adaptability to changes in requirements. Sub-characteristics include adaptability, scalability, and installability.

### Safety

Represents the software's ability to avoid harm or endangerment. Sub-characteristics include operational constraint, risk identification, fail-safe, and hazard warning.

In addition to the ISO/IEC 25010 evaluation, the System Usability Scale (SUS) is used for general end-user evaluation. SUS consists of ten standardized questions measuring both positive and negative perceptions of the system (Bangor et al., 2009; Brooke, 2013).

## Data Analysis

The data analysis for the tracer study is conducted using both descriptive and inferential statistical methods.

### Descriptive Statistics

Frequency counts and percentages are used to describe the distribution of responses for categorical variables such as employment status, job position, and degree program. The weighted arithmetic mean is used to calculate average ratings for Likert-scale items.

### Interpretation Scale

For evaluation using a 5-point Likert scale, the following interpretation is applied:

| Mean Range | Interpretation |
|-----------|----------------|
| 4.21 – 5.00 | Very Satisfied / Strongly Agree |
| 3.41 – 4.20 | Satisfied / Agree |
| 2.61 – 3.40 | Neutral |
| 1.81 – 2.60 | Dissatisfied / Disagree |
| 1.00 – 1.80 | Very Dissatisfied / Strongly Disagree |

### Employment Rate Calculation

The employment rate is calculated using the formula:

> Employment Rate = (Number of Employed Graduates / Total Number of Respondents) × 100

### Course Relatedness Analysis

The course-relatedness score is analyzed to determine the degree of alignment between graduates' degree programs and their current employment. Mean scores are calculated for each degree program and compared across different variables.

### Skills Analysis

Skills and competencies data are analyzed to identify the most useful skills in the workplace. Rankings are generated based on frequency of mention and mean usefulness ratings.



---

# Chapter III — Implementation

This chapter presents the implementation of the BU Alumni Tracer Study platform, covering the system overview, detailed implementation of the web portal, admin portal, and mobile application, and a demonstration of key features.

## System Overview

The BU Alumni Tracer Study platform is implemented as three interconnected client applications sharing a unified Supabase backend. The platform enables Baliuag University graduates to complete tracer surveys, engage with fellow alumni through a community forum, browse an alumni directory, and receive AI-powered assistance. University administrators access a separate portal for analytics, user management, and content moderation.

The implementation follows the iterative and incremental development methodology, with each application developed in parallel against the shared backend API. The system architecture ensures data consistency, real-time synchronization, and secure access control across all components.

## Web Portal Implementation

The BU Alumni Web portal is implemented as a Next.js 15 application using the App Router. The portal serves as the primary access point for graduates on desktop and mobile browsers.

### Public Pages

**Landing Page (`/`).** The landing page presents Baliuag University branding with the BU logo, a hero section featuring the tagline "Track. Connect. Thrive.", and feature highlights for the tracer study, alumni forum, directory, and insights. Call-to-action buttons direct visitors to sign up or sign in.

**Login Page (`/login`).** The login page provides email and password authentication with validation. Users can also navigate to password reset or sign-up flows. Upon successful authentication, the middleware refreshes the session and redirects to the dashboard.

**Sign-Up Page (`/signup`).** The registration form collects first name, middle name (optional), last name, email, password with strength meter, confirm password, college, degree, and batch year. Zod schema validation ensures data integrity before submission to Supabase Auth.

**Forgot Password Page (`/forgot-password`).** Allows users to request a password reset link sent to their registered email address.

### Authenticated Pages

**Dashboard (`/dashboard`).** The dashboard displays a welcome banner with the alumni's name and avatar, quick stats on employment rates and forum activity, a survey status card with completion percentage, recent forum threads, and a notifications panel.

**Tracer Study (`/survey`).** A multi-step wizard implementing the full CHED GTS questionnaire across 5 steps: General Information, Educational Background, Trainings, Employment Data, and Skills & Feedback. Progress is auto-saved as a draft after each step. Final submission locks the response and updates analytics.

**Forum (`/forum`).** The forum section includes a category index showing all 7 categories with thread counts, thread lists per category with sorting and filtering, thread detail pages with real-time reply updates via Supabase Realtime, a new thread composer, a search page with full-text search, and a bookmarks page.

**Directory (`/directory`).** The alumni directory presents a searchable and filterable grid of alumni profiles. Users can search by name, degree, batch year, or college. Profile pages display public information with a privacy toggle.

**Profile (`/profile`).** The profile page displays the user's avatar, name, batch year, degree, college, bio, forum post history, and survey submission status. Users can edit their profile information and upload a new avatar.

**Settings (`/settings`).** The settings page includes account information management, appearance settings (dark/light mode), and security settings including password changes.

**Notifications (`/notifications`).** A dedicated page listing all notifications with unread counts, real-time updates, and mark-as-read functionality.

## Admin Portal Implementation

The BU Alumni Admin portal is implemented as a separate Next.js 15 application with stricter authentication requirements, including mandatory two-factor authentication for all admin accounts.

### Admin Pages

**Dashboard (`/`).** The admin dashboard presents an overview of platform metrics including total users, submitted GTS responses, forum threads, and pending moderation reports. Quick links provide navigation to all administrative functions.

**Respondents (`/respondents`).** A comprehensive table of all GTS submissions with global search, filter chips (college, batch year, status, employment status), sortable columns, and bulk CSV export functionality.

**Analytics (`/analytics`).** Deep-dive analytics with charts including employment rate by college, employment rate by batch year, time to first job distribution, job level comparisons, salary range histograms, top industries, curriculum relevance gauges, and response rate tables.

**Forum (`/forum`).** The forum moderation queue displays flagged threads and replies sorted by report count. Administrators can dismiss reports, warn users, delete posts, or ban users. Additional views include all threads with pin/lock/move/delete controls and category management.

**Users (`/users`).** User management table with avatar, name, email, degree, batch year, role, 2FA status, and account actions including role changes, email verification, suspension, and deletion.

**Settings (`/settings`).** Admin configuration including portal settings, active questionnaire management, email template editing, 2FA enforcement toggle, and maintenance mode control.

## Mobile Application Implementation

The BU Alumni Mobile application is implemented using Flutter 3.22+ with a single codebase targeting Android and iOS devices.

### Auth Flow

**Splash Screen.** Displays the Baliuag University logo and app branding on launch.

**Login Screen.** Email and password authentication with input validation and error feedback.

**Sign-Up Screen.** Multi-field registration collecting first name, middle name, last name, email, password, college, degree, and batch year with real-time validation.

**Forgot Password Screen.** Email entry for password reset link delivery.

### Main Application Shell

The main application uses a bottom navigation bar with five tabs:

**Home Tab.** Displays a welcome card with survey progress, forum highlight threads, quick stats widgets, and the BUddy AI chatbot floating action button.

**Forum Tab.** Provides access to the forum category grid, thread lists per category, thread detail with real-time replies, and thread creation.

**Survey Tab.** Contains the survey landing screen with status information, the 5-step CHED GTS wizard (General Info, Education, Trainings, Employment, Skills), and the submission confirmation screen.

**Directory Tab.** Alumni directory with search, filter chips, list view, and detailed profile screens.

**Profile Tab.** User profile display, edit profile screen, and settings screen with theme toggle, notification preferences, and account management.

## Key Features Demonstration

### CHED GTS 5-Step Survey

The tracer study questionnaire is implemented as a guided multi-step wizard aligned with the CHED Graduate Tracer Study format. Step 1 collects general information including permanent address, civil status, sex, birthday, and region. Step 2 captures educational background with repeatable degree entries and professional examinations. Step 3 records trainings and advanced studies. Step 4 collects detailed employment data with conditional branching based on employment status. Step 5 gathers skills feedback and peer referrals.

Auto-save functionality persists draft responses after each step, allowing users to resume later. Upon final submission, the response status changes to "submitted" and analytics materialized views are updated.

### Alumni Forum with Real-Time Replies

The forum system supports 7 categories including Announcements, Career Advice, Alumni Network, Industry Talk, Campus Life, Opportunities, and General. Users create threads with titles and body content, reply to threads with nesting support, react with emoji (👍, ❤️, 🎉, 💡, 🙏), bookmark threads for later access, and search across all content using PostgreSQL full-text search.

Real-time reply updates are delivered via Supabase Realtime WebSocket subscriptions, instantly showing new replies to all users viewing a thread without requiring page refresh.

### AI Chatbot (BUddy)

BUddy is accessible via a floating action button on mobile and a chat panel on web. The chatbot communicates with a Supabase Edge Function that wraps the Google Gemini 2.0 Flash API. BUddy answers questions about tracer study sections, navigates users to relevant platform features, explains employment statistics, and provides general assistance about Baliuag University. All API keys remain server-side, ensuring security.

### Directory and Search

The alumni directory enables graduates to find and connect with fellow BU graduates. Profiles display public information including name, avatar, batch year, degree, college, and bio. Privacy settings allow users to control the visibility of their contact information. Search functionality supports filtering by name, degree, batch year, and college.

### Admin Analytics and Moderation

The admin portal provides comprehensive analytics through Recharts visualizations. Employment statistics are aggregated via the `mv_employment_stats` materialized view refreshed nightly. Forum moderation includes a reports queue with actions to dismiss, warn, delete, or ban. All administrative actions are logged to the `audit_logs` table for compliance review.

### Notifications System

The notification system delivers real-time alerts for forum replies, reactions, mentions, and system announcements. Notifications are stored in the `notifications` table and delivered via Supabase Realtime subscriptions. Users can view their notification history, mark items as read, and manage notification preferences.



---

# Chapter IV — Evaluation and Results

This chapter presents the evaluation framework, data analysis procedures, and expected results for the BU Alumni Tracer Study platform.

## Evaluation Framework

The system is evaluated using two complementary approaches: a technical evaluation based on the ISO/IEC 25010 software product quality model and a user evaluation using the System Usability Scale (SUS).

### ISO/IEC 25010 Technical Evaluation

The ISO/IEC 25010 software product quality model provides a structured framework for assessing the technical quality of the platform across nine characteristics. Each characteristic is evaluated using a 5-point Likert scale administered to a panel of evaluators including IT professionals, faculty members, and administrators.

**Functional Suitability (25%).** Evaluates whether the system provides the complete set of functions required by users, including tracer survey completion, forum participation, directory browsing, profile management, admin analytics, and AI assistance.

**Performance Efficiency (15%).** Measures response times for page loads, database queries, real-time updates, and chart rendering across the web portal, admin portal, and mobile application.

**Compatibility (10%).** Assesses cross-browser compatibility for the web portals and cross-device compatibility for the mobile application.

**Interaction Capability / Usability (20%).** Evaluates ease of learning, operability, user error protection, and engagement across all three platform components.

**Reliability (10%).** Measures fault tolerance, availability, and recoverability under normal and peak usage conditions.

**Security (10%).** Assesses data confidentiality, integrity, authentication strength, authorization enforcement, and audit trail completeness.

**Maintainability (5%).** Evaluates code modularity, reusability, analyzability, and testability.

**Flexibility (3%).** Assesses adaptability to requirement changes and scalability for increased user loads.

**Safety (2%).** Evaluates operational constraints and fail-safe mechanisms.

### System Usability Scale (SUS) User Evaluation

The System Usability Scale is administered to graduate respondents and administrative users after they have used the platform for at least two weeks. The SUS consists of 10 standardized statements rated on a 5-point Likert scale from "Strongly Disagree" to "Strongly Agree." The raw scores are converted to a 0–100 scale, with scores above 68 considered above average usability (Bangor et al., 2009; Brooke, 2013).

SUS is administered separately for:
- Web portal users (graduates accessing via browser)
- Mobile application users (graduates accessing via Flutter app)
- Admin portal users (university staff)

## Data Analysis Procedures

### Tracer Study Data Analysis

The data collected from the CHED GTS questionnaire is analyzed using descriptive statistics to answer the tracer study research questions.

**Employment Status Analysis.** Frequency counts and percentages describe the distribution of graduates across employment categories: employed, not employed, and never employed. The overall employment rate is calculated as:

> Employment Rate = (Number of Employed Graduates / Total Number of Respondents) × 100

**Time to First Job Analysis.** The time elapsed between graduation and first employment is categorized into intervals (< 1 month, 1–6 months, 7–11 months, 1–2 years, 2+ years). Frequency distributions and percentages describe the time-to-employment landscape.

**Nature of Employment Analysis.** Cross-tabulations describe employment types (regular, temporary, contractual, casual, self-employed), job levels (rank/clerical, professional/technical, managerial, self-employed), and initial salary ranges.

**Course Relatedness Analysis.** The curriculum relevance responses (yes/no) are analyzed by degree program to identify programs with high or low alignment to graduate employment.

**Skills Analysis.** Frequency counts identify the most commonly cited useful competencies. Mean ratings compare the perceived usefulness of different skill categories.

### System Quality Data Analysis

**ISO 25010 Scoring.** For each quality characteristic, the mean score across all evaluators is computed. The overall system quality score is the weighted average of all characteristics based on the defined weight distribution.

**SUS Scoring.** Standard SUS scoring procedures are applied: odd-numbered items contribute their scale position minus 1; even-numbered items contribute 5 minus their scale position. The sum of all item scores is multiplied by 2.5 to obtain the final SUS score (0–100).

## Expected Results

### Tracer Study Expected Outcomes

Based on related literature and the current labor market context, the following outcomes are anticipated:

**Employment Status.** A majority of respondents are expected to be employed, consistent with trends observed in similar tracer studies of Philippine higher education institutions (Ramel, 2025; Bensi et al., 2024).

**Time to First Job.** Most employed graduates are expected to have secured their first job within 6 months of graduation, aligning with findings from previous studies on business and technology graduates (Torrejas & Ordaneza, 2025).

**Nature of Employment.** Regular or permanent employment is expected to be the most common employment type among respondents, followed by contractual and self-employed arrangements.

**Course Relatedness.** A positive correlation between degree program and current occupation is expected, with information technology and business administration graduates showing high curriculum relevance.

**Skills and Competencies.** Communication skills, problem-solving skills, and information technology skills are expected to be among the most frequently cited useful competencies, consistent with findings from Abana et al. (2021) and Pallo & Pallo (2023).

### System Evaluation Expected Outcomes

**ISO/IEC 25010.** The system is expected to achieve an overall quality rating of "Satisfactory" or higher (mean ≥ 3.41) across all characteristics, with particularly strong performance in Functional Suitability and Usability due to the iterative design process and stakeholder feedback integration.

**System Usability Scale.** The platform is expected to achieve SUS scores above 68 (above-average usability) across all three components, with the web portal potentially scoring highest due to the familiarity of browser-based interfaces and the mobile application benefiting from Material Design 3 conventions.

---

# References

Abana, A. S., Ramos, A. B., Gumarang, B. K., Jr., & Tarun, J. Z. (2021). The graduates tracer study: Bachelor of elementary education program. *International Journal of Multidisciplinary: Applied Business and Education Research, 2*(10), 918–927. https://doi.org/10.11594/ijmaber.02.10.09

Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. *Journal of Usability Studies, 4*(3), 114–123. https://uxpajournal.org/determining-what-individual-sus-scores-mean/

Bensi, L. P., Bensi, M. E., Alcantara, G. M., & Pula, R. L. (2024). Assessing employment outcomes and curriculum relevance of BSIT graduates batch 2021: A graduate tracer study at Nueva Ecija University of Science and Technology. *International Journal of Research and Scientific Innovation, 11*(11), 10–21. https://doi.org/10.51244/IJRSI.2024.1111002

Brooke, J. (2013). SUS: A retrospective. *Journal of Usability Studies, 8*(2), 29–40. https://uxpajournal.org/sus-a-retrospective/

Cornillez, E. E. C., Jr., Caminoc, S. R. T., Basas, B. R., Militante, B. T., Jr., & Paler, R. R. (2021). Tracer study of teacher education graduates of the Eastern Visayas State University Tanauan Campus, Philippines. *European Journal of Education and Pedagogy, 2*(3), 186–193. https://doi.org/10.24018/ejedu.2021.2.3.143

Dela Cruz, J. L. (2022). Tracer study of graduate school graduates of a state higher education institution in the Philippines from 2016 to 2020. *International Journal of Education and Literacy Studies, 10*(2), 149–154. https://doi.org/10.7575/aiac.ijels.v.10n.2p.149

European Commission. (2020). *European graduate tracking initiative: Methodological framework*. Publications Office of the European Union. https://op.europa.eu/en/publication-detail/-/publication/6f0c9f74-6a8b-11ea-b735-01aa75ed71a1

Guzman, R. B. D., & Maling, Z. R. (2025). Graduate employability and career pathways: A tracer study of hospitality and tourism management graduates in the Philippines (2015–2021). *International Journal of Research and Innovation in Social Science, 9*(9), 5816–5824. https://doi.org/10.47772/IJRISS.2025.909000472

Harvey, L. (2001). Defining and measuring employability. *Quality in Higher Education, 7*(2), 97–109.

International Labour Organization. (2022). *Global employment trends for youth 2022*. https://www.ilo.org/global/research/global-reports/youth

Ibrahim, S. (2020). Iterative and incremental development model. *International Journal of Software Engineering and Applications, 11*(5), 1–12.

Larman, C., & Basili, V. R. (2003). Iterative and incremental developments: A brief history. *Computer, 36*(6), 47–56. https://doi.org/10.1109/MC.2003.1204375

Nonyelum, O. F. (2020). Iterative and incremental development analysis study of vocational career information systems. *International Journal of Software Engineering and Applications, 11*(5). https://doi.org/10.5121/ijsea.2020.11502

OECD. (2019). *The future of work and education: Tracking graduate outcomes internationally*. https://www.oecd.org

Pallo, M. M., & Pallo, M. E. (2023). Job level position and academic competencies: A tracer study of engineering graduates in Biliran Province State University. *Innovative Technology and Management Journal, 6*. https://doi.org/10.70954/0e6xd626

Ramel, M. (2025). Graduate tracer study on BSBA programs of financial management and marketing management: Basis for curriculum development. *Aloysian Interdisciplinary Journal of Social Sciences, Education, and Allied Fields, 1*(7), 288–305. https://doi.org/10.5281/zenodo.16870457

Sarsale, M., Garcia, C., & Uy, I. (2024). Dimensions of program relevance towards employment success: Evidence from a graduate tracer study using principal component analysis. *Journal of Teaching and Learning for Graduate Employability, 15*(1), 205–224. https://doi.org/10.21153/jtlge2024vol15no1art1895

Torrejas, I. E., & Ordaneza, E. L. (2025). Tracking the employment status of BSBA marketing management graduates: A tracer study. *International Journal of Research and Innovation in Social Science, 9*(8). https://doi.org/10.47772/IJRISS.2025.908000014

UNESCO. (2021). *Reimagining our futures together: A new social contract for education*. https://unesdoc.unesco.org

Valdez, E. J. V., & Argel, H. P. (2025). Graduate tracer study for the Bachelor of Science in Cooperative Management graduates. *International Journal of Multidisciplinary Research and Analysis*. https://doi.org/10.47191/ijmra/v8-i02-41

Yorke, M. (2006). Employability in higher education: What it is — what it is not. *Learning and Employability Series, 1*. Higher Education Academy.

