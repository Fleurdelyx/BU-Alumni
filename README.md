# BU Alumni Tracer - Flutter Mobile App

A comprehensive graduate tracer study application for Baliuag University that tracks alumni career development and outcomes. The app connects to Firebase for real-time data synchronization and includes AI-powered chat support.

## 📱 Download APK for Testing

### Quick Download
1. Go to the [Releases page](../../releases)
2. Download the latest `bu-alumni-tracer-debug.apk` (recommended for testing) 
3. Enable "Install from Unknown Sources" in your Android settings
4. Install the downloaded APK

### First Time Setup?
📋 **New to this repository?** Follow the [APK Download Guide](APK-DOWNLOAD-GUIDE.md) for complete setup instructions.

### Automatic Builds
- **Debug APK**: Includes debugging information, recommended for testing
- **Release APK**: Optimized production version
- New releases are automatically built when version tags are created

## ✨ Features

- **User Authentication**: Firebase Authentication with sign-up/sign-in
- **Questionnaires**: Interactive surveys for alumni to complete
- **Participants Directory**: Browse other alumni's profiles and career information
- **Statistics & Analytics**: 
  - Bar charts for alumni by original course
  - Pie charts for course relatedness to current jobs
  - Charts displaying job fields and employment data
- **AI Chatbot (BUddy)**: Intelligent assistant for answering questions about the app
- **Settings**:
  - Dark mode toggle
  - Avatar customization
  - Account management
  - Password change
  - Account deletion with confirmation
- **Color Scheme**: Green theme (#006d1d, #4c992d) with Goudy Old Style font

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── firebase_options.dart     # Firebase configuration
├── models/
│   ├── alumni_user.dart     # User model
│   ├── questionnaire.dart   # Questionnaire models
│   └── statistics.dart      # Statistics models
├── services/
│   ├── auth_service.dart    # Firebase Auth service
│   ├── firestore_service.dart # Firestore database service
│   └── chatbot_service.dart  # Google Generative AI service
├── providers/
│   ├── theme_provider.dart  # Dark mode state
│   ├── user_provider.dart   # User state
│   ├── questionnaire_provider.dart
│   └── statistics_provider.dart
├── screens/
│   ├── auth/
│   │   └── login_screen.dart
│   ├── home/
│   │   ├── home_screen.dart
│   │   ├── questionnaires_section.dart
│   │   ├── questionnaire_detail_screen.dart
│   │   ├── participants_section.dart
│   │   └── statistics_section.dart
│   └── settings/
│       └── settings_screen.dart
├── widgets/
│   └── chatbot_widget.dart
└── theme/
    └── app_theme.dart
```

## Setup Instructions

### 1. Prerequisites
- Flutter SDK 3.0+
- Android SDK / iOS SDK
- Firebase account
- Google AI API Key (for BUddy chatbot)

### 2. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "bu-alumni-tracer"
3. Enable Firebase Authentication (Email/Password)
4. Create a Firestore database in production mode
5. Create Firebase Storage bucket

#### Configure Firebase Options
Update `lib/firebase_options.dart` with your Firebase credentials for Android and iOS:

```dart
android = FirebaseOptions(
  apiKey: 'YOUR_ANDROID_API_KEY',
  appId: '1:YOUR_PROJECT_NUMBER:android:YOUR_APP_ID',
  messagingSenderId: 'YOUR_PROJECT_NUMBER',
  projectId: 'bu-alumni-tracer',
  storageBucket: 'bu-alumni-tracer.appspot.com',
);
```

#### Firestore Database Structure

Create the following collections and documents:

**Collection: `users`**
```json
{
  "id": "user_id",
  "email": "alumni@example.com",
  "fullName": "John Doe",
  "avatarUrl": "https://...",
  "originalCourse": "Computer Science",
  "currentJobTitle": "Software Engineer",
  "currentField": "Technology",
  "courseRelatedness": 0.9,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-03-01T15:45:00Z",
  "isActive": true
}
```

**Collection: `questionnaires`**
```json
{
  "id": "q1",
  "title": "Career Development Survey",
  "description": "Help us understand your career journey",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "questions": [
    {
      "id": "q1_1",
      "title": "What is your original course?",
      "type": "text",
      "required": true
    },
    {
      "id": "q1_2",
      "title": "How closely related is your current job to your degree?",
      "type": "multipleChoice",
      "options": ["Highly Related", "Related", "Somewhat Related", "Not Related"],
      "required": true
    },
    {
      "id": "q1_3",
      "title": "Rate your job satisfaction (1-5)",
      "type": "rating",
      "required": true
    }
  ]
}
```

**Collection: `responses`**
```json
{
  "id": "response_id",
  "userId": "user_id",
  "questionnaireId": "q1",
  "isComplete": true,
  "submittedAt": "2026-02-15T10:30:00Z",
  "answers": {
    "q1_1": "Computer Science",
    "q1_2": "Highly Related",
    "q1_3": 5
  }
}
```

**Document: `statistics/current`**
```json
{
  "totalAlumni": 1500,
  "respondents": 450,
  "responseRate": 0.3,
  "courseStatistics": [
    {
      "courseName": "Computer Science",
      "count": 120,
      "percentage": 0.267
    },
    {
      "courseName": "Information Technology",
      "count": 95,
      "percentage": 0.211
    }
  ],
  "relatednessStatistics": [
    {
      "category": "Highly Related",
      "count": 315,
      "percentage": 0.7
    },
    {
      "category": "Somewhat Related",
      "count": 90,
      "percentage": 0.2
    },
    {
      "category": "Not Related",
      "count": 45,
      "percentage": 0.1
    }
  ],
  "fieldStatistics": [
    {
      "fieldName": "Technology",
      "count": 200,
      "percentage": 0.444,
      "jobTitles": ["Software Engineer", "IT Manager", "Developer"]
    }
  ],
  "lastUpdated": "2026-03-01T00:00:00Z"
}
```

### 3. Google AI Setup

#### Get Google AI API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Update `lib/services/chatbot_service.dart`:
```dart
const apiKey = 'YOUR_GOOGLE_AI_API_KEY';
```

### 4. Install Dependencies

```bash
flutter pub get
```

### 5. Generate Riverpod Code (Optional)

If using Riverpod generator:
```bash
flutter pub run build_runner build
```

## Running the App

### Android
```bash
flutter run -d <device_id>
```

### iOS
```bash
cd ios
pod install
cd ..
flutter run -d <device_id>
```

## APK/App Build

### Android APK
```bash
flutter build apk --release
```

### Android App Bundle
```bash
flutter build appbundle --release
```

## Security Notes

- Never commit API keys or Firebase credentials
- Use Firebase Security Rules to protect user data
- Implement proper authentication checks on all Firestore operations
- Enable SSL/TLS for all Firebase connections
- Regularly rotate API keys

## Font Setup

The app uses Goudy Old Style Roman font for branding. Ensure the font file is included in your assets:
- Add font file to `assets/fonts/`
- Update `pubspec.yaml` with font configuration

## 🚀 Creating Releases (For Developers)

### How to Create a New Release
1. **Create a Git tag** with version number:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions automatically**:
   - Builds debug and release APKs
   - Creates a new release
   - Uploads APKs as downloadable assets

### Manual Build (Local Testing)
```bash
# Debug APK (with debugging info)
flutter build apk --debug

# Release APK (optimized)
flutter build apk --release
```

### Release Versioning
- Use semantic versioning: `v1.0.0`, `v1.1.0`, `v2.0.0`
- Update version in `pubspec.yaml` before creating tags:
  ```yaml
  version: 1.0.0+1
  ```

## 🛠️ Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `firebase_options.dart`
- Check Firestore rules allow read/write for authenticated users
- Ensure internet connectivity

### Missing Font
- Add the Goudy Old Style Roman font file to `assets/fonts/`
- Run `flutter clean` and `flutter pub get`

### Chatbot Not Working
- Verify Google AI API key is valid
- Check API key has Generative Language API enabled
- Ensure internet connectivity

## Future Enhancements

- Export statistics to PDF
- Advanced filtering in participants list
- Email notifications for questionnaires
- Analytics dashboard for administrators
- Multi-language support
- Offline mode with sync

## License

© 2026 Baliuag University. All rights reserved.

## Support

For support or questions, contact the development team or create an issue in the repository.
