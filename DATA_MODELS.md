# BU Alumni Tracer - Data Models & API Documentation

## Data Models Overview

### 1. AlumniUser Model

**Purpose**: Represents a user account in the system

**Dart Class Location**: `lib/models/alumni_user.dart`

**Fields**:
```dart
- id: String                    // Firebase Auth UID
- email: String                // User's email (unique)
- fullName: String             // User's full name
- avatarUrl: String?           // URL to profile picture (optional)
- originalCourse: String?      // Alumni's original degree/course
- currentJobTitle: String?     // Current job position
- currentField: String?        // Industry/field of work
- courseRelatedness: double?   // Score 0-1 indicating job/course match
- createdAt: DateTime          // Account creation timestamp
- updatedAt: DateTime?         // Last update timestamp
- isActive: bool               // Account status
```

**Example JSON**:
```json
{
  "id": "user_123",
  "email": "alumni@example.com",
  "fullName": "Juan Dela Cruz",
  "avatarUrl": "https://storage.googleapis.com/bucket/avatars/user_123.jpg",
  "originalCourse": "Bachelor of Science in Computer Science",
  "currentJobTitle": "Senior Software Engineer",
  "currentField": "Technology",
  "courseRelatedness": 0.95,
  "createdAt": "2025-06-15T10:30:00Z",
  "updatedAt": "2026-02-20T14:45:00Z",
  "isActive": true
}
```

**Firestore Path**: `/users/{userId}`

---

### 2. Question Model

**Purpose**: Individual survey question

**Location**: `lib/models/questionnaire.dart`

**Fields**:
```dart
- id: String                        // Unique question ID
- title: String                    // Question text
- type: String                     // 'text', 'multipleChoice', 'rating', 'date'
- options: List<String>?           // Answer choices (for multipleChoice)
- required: bool                   // Whether answer is mandatory
```

**Question Types**:
- `text`: Free-form text input
- `multipleChoice`: Single select from options
- `rating`: 1-5 star rating
- `date`: Date picker

**Example**:
```json
{
  "id": "q1_1",
  "title": "How closely related is your current job to your degree?",
  "type": "multipleChoice",
  "options": ["Highly Related", "Related", "Somewhat Related", "Not Related"],
  "required": true
}
```

---

### 3. Questionnaire Model

**Purpose**: Collection of survey questions

**Location**: `lib/models/questionnaire.dart`

**Fields**:
```dart
- id: String                        // Unique questionnaire ID
- title: String                    // Survey title
- description: String              // Survey description
- questions: List<Question>        // Array of questions
- createdAt: DateTime              // Creation timestamp
- isActive: bool                   // Whether survey is available
```

**Example JSON**:
```json
{
  "id": "q1",
  "title": "Career Development Survey 2026",
  "description": "Help us track your career progress",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "questions": [
    {
      "id": "q1_1",
      "title": "What is your current job title?",
      "type": "text",
      "required": true
    },
    {
      "id": "q1_2",
      "title": "How satisfied are you with your job?",
      "type": "rating",
      "required": true
    }
  ]
}
```

**Firestore Path**: `/questionnaires/{questionnaireId}`

---

### 4. QuestionnaireResponse Model

**Purpose**: User's submitted answer to a questionnaire

**Location**: `lib/models/questionnaire.dart`

**Fields**:
```dart
- id: String                        // Unique response ID
- userId: String                   // ID of respondent
- questionnaireId: String          // Which questionnaire
- answers: Map<String, dynamic>   // Question ID to answer mapping
- submittedAt: DateTime            // When submitted
- isComplete: bool                 // Whether fully completed
```

**Example JSON**:
```json
{
  "id": "response_abc123",
  "userId": "user_123",
  "questionnaireId": "q1",
  "isComplete": true,
  "submittedAt": "2026-02-15T10:30:00Z",
  "answers": {
    "q1_1": "Senior Software Engineer",
    "q1_2": 5,
    "q1_3": "Technology",
    "q1_4": "Highly Related"
  }
}
```

**Firestore Path**: `/responses/{responseId}`

---

### 5. Statistics Model

**Purpose**: Aggregated data about all alumni

**Location**: `lib/models/statistics.dart`

**Fields**:
```dart
- totalAlumni: int                           // Total alumni count
- respondents: int                           // Number who responded
- responseRate: double                       // respondents/totalAlumni
- courseStatistics: List<CourseStatistic>   // Breakdown by course
- relatednessStatistics: List<RelatednessStatistic>
- fieldStatistics: List<JobFieldStatistic>
- lastUpdated: DateTime
```

**Example JSON**:
```json
{
  "totalAlumni": 1500,
  "respondents": 450,
  "responseRate": 0.3,
  "lastUpdated": "2026-03-01T00:00:00Z",
  "courseStatistics": [
    {
      "courseName": "Bachelor of Science in Computer Science",
      "count": 120,
      "percentage": 0.267
    }
  ],
  "relatednessStatistics": [
    {
      "category": "Highly Related",
      "count": 315,
      "percentage": 0.7
    }
  ],
  "fieldStatistics": [
    {
      "fieldName": "Technology",
      "count": 200,
      "percentage": 0.444,
      "jobTitles": ["Software Engineer", "IT Manager", "Systems Analyst"]
    }
  ]
}
```

**Firestore Path**: `/statistics/current`

---

### 6. CourseStatistic Model

**Purpose**: Alumni distribution by original course

**Fields**:
```dart
- courseName: String    // Name of course
- count: int            // Number of alumni
- percentage: double    // count/total alumni
```

---

### 7. RelatednessStatistic Model

**Purpose**: Distribution of job relatedness to course

**Fields**:
```dart
- category: String      // e.g., "Highly Related", "Not Related"
- count: int            // Number of alumni in category
- percentage: double    // Percentage of respondents
```

---

### 8. JobFieldStatistic Model

**Purpose**: Alumni employment by industry

**Fields**:
```dart
- fieldName: String         // Industry name (e.g., "Technology", "Finance")
- count: int                // Number of alumni
- percentage: double        // count/total respondents
- jobTitles: List<String>  // Sample job titles in field
```

---

## Firestore Collection Structure

```
firestore
├── users/
│   ├── uid1/
│   ├── uid2/
│   └── uid3/
│
├── questionnaires/
│   ├── q1/
│   │   └── questions: [...]
│   ├── q2/
│   └── q3/
│
├── responses/
│   ├── response1/
│   ├── response2/
│   └── response3/
│
└── statistics/
    └── current/
        ├── totalAlumni: 1500
        ├── respondents: 450
        └── courseStatistics: [...]
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - private data, only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Questionnaires - public read for authenticated users
    match /questionnaires/{questionnaire=**} {
      allow read: if request.auth != null;
    }

    // Responses - only owner can read/write
    match /responses/{responseId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // Statistics - public read for all authenticated users
    match /statistics/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

## API Methods by Service

### AuthService (`lib/services/auth_service.dart`)

```dart
// Sign up new user
Future<bool> signUp({
  required String email,
  required String password,
  required String fullName,
})

// Login user
Future<bool> signIn({
  required String email,
  required String password,
})

// Reset password
Future<bool> resetPassword({required String email})

// Change password
Future<bool> changePassword({
  required String currentPassword,
  required String newPassword,
})

// Delete account
Future<bool> deleteAccount({required String password})

// Logout
Future<void> signOut()

// Get current user ID
String? getCurrentUserId()

// Get current user email
String? getCurrentUserEmail()

// Stream of auth state changes
Stream<User?> get authStateChanges
```

### FirestoreService (`lib/services/firestore_service.dart`)

```dart
// User Operations
Future<void> createUser(AlumniUser user)
Future<AlumniUser?> getUser(String userId)
Future<void> updateUser(AlumniUser user)
Future<void> deleteUser(String userId)
Stream<AlumniUser?> getUserStream(String userId)

// Questionnaire Operations
Future<List<Questionnaire>> getQuestionnaires()
Stream<List<Questionnaire>> getQuestionnairesStream()

// Response Operations
Future<void> submitResponse(QuestionnaireResponse response)
Stream<List<QuestionnaireResponse>> getUserResponsesStream(String userId)

// Statistics Operations
Future<Statistics> getStatistics()
Stream<Statistics> getStatisticsStream()

// Participants
Stream<List<AlumniUser>> getAllUsersStream()
```

### ChatbotService (`lib/services/chatbot_service.dart`)

```dart
// Get response from BUddy
Future<String> getBUddyResponse(String userMessage)

// Reset chat session
void resetChat()
```

## Data Validation Rules

### AlumniUser
- `email`: Must be valid email format
- `fullName`: Required, 2-100 characters
- `courseRelatedness`: Must be 0-1
- `isActive`: Boolean only

### Question
- `title`: Required, non-empty
- `type`: Must be one of: text, multipleChoice, rating, date
- For `multipleChoice`: options must be non-empty array

### QuestionnaireResponse
- `answers`: Must have entry for each question with required=true
- `userId`: Must match authenticated user
- `questionnaire Id`: Must reference existing questionnaire

### Statistics
- `totalAlumni`: >= 0
- `respondents`: <= totalAlumni
- `responseRate`: Must equal respondents/totalAlumni
- All percentages in items: Must sum to 1.0 (±0.01)

## Example Queries

### Get User Profile
```dart
final user = await firestoreService.getUser(userId);
```

### Get Active Questionnaires
```dart
final questionnaires = await firestoreService.getQuestionnaires();
```

### Submit Response
```dart
final response = QuestionnaireResponse(
  id: Uuid().v4(),
  userId: userId,
  questionnaireId: 'q1',
  answers: {
    'q1_1': 'Senior Engineer',
    'q1_2': 4,
  },
  submittedAt: DateTime.now(),
  isComplete: true,
);
await firestoreService.submitResponse(response);
```

### Get Statistics
```dart
final stats = await firestoreService.getStatistics();
// Use for charts and analytics
```

## Performance Considerations

- Questionnaires cached locally with SharedPreferences
- User data streamed for real-time updates
- Pagination recommended for large participant lists (not yet implemented)
- Statistics cached with 1-hour TTL recommendation
- Indexes created on frequently queried fields

## Backup & Recovery

- Firestore automatic backups enabled
- Regular exports to Cloud Storage recommended
- User data import/export via Firestore Console
- Quarterly backup verification

---

For more information, see README.md and SETUP.md
