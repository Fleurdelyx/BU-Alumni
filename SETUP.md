# BU Alumni Tracer - Developer Setup Guide

## Complete Setup Instructions for New Developers

### Step 1: Clone and Initial Setup

```bash
# Clone the repository (if applicable)
git clone <repository-url>
cd "BU Alumni"

# Get Flutter dependencies
flutter pub get

# Build runner for Riverpod (if using code generation)
flutter pub run build_runner build
```

### Step 2: Firebase Project Configuration

#### A. Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Create Project" → Enter "bu-alumni-tracer"
3. Enable Google Analytics (optional but recommended)
4. Create project

#### B. Set Up Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. (Optional) Enable other providers like Google Sign-in

#### C. Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create Database"
3. Select **Production mode** (for development, you can use Testing mode)
4. Choose a location close to your users
5. Review and create

#### D. Set Up Cloud Storage
1. Go to **Storage**
2. Click "Get Started"
3. Choose a storage location
4. Set up storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /documents/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Configure Firebase Credentials

#### For Android:
1. In Firebase Console, click **Project Settings**
2. Go to **Your apps** section
3. Click "Add app" → Select **Android**
4. Enter package name: `com.baliuag.alumni_tracer`
5. Download **google-services.json**
6. Place in: `android/app/google-services.json`

#### For iOS:
1. Same process, select **iOS**
2. Enter Bundle ID: `com.baliuag.alumni_tracer`
3. Download **GoogleService-Info.plist**
4. Place in: `ios/Runner/GoogleService-Info.plist`
5. Add to Xcode project (check "Copy items if needed")

#### Update Firebase Options
1. Go to **Project Settings** → **General**
2. Scroll down to find your app configurations
3. Update `lib/firebase_options.dart` with credentials:

```dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'AIzaSy...', // Copy from google-services.json
  appId: '1:123456789:android:abc123...',
  messagingSenderId: '123456789',
  projectId: 'bu-alumni-tracer',
  storageBucket: 'bu-alumni-tracer.appspot.com',
);
```

### Step 4: Google AI Setup (For BUddy Chatbot)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create new API key in default project
4. Copy the API key
5. Update `lib/services/chatbot_service.dart`:

```dart
const apiKey = 'YOUR_GOOGLE_AI_API_KEY_HERE';
```

### Step 5: Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Questionnaires - anyone authenticated can read
    match /questionnaires/{questionnaire=**} {
      allow read: if request.auth != null;
    }

    // Responses - only owner can read/write
    match /responses/{responseId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // Statistics - anyone authenticated can read
    match /statistics/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

### Step 6: Initialize Sample Data

Create the following in Firestore:

#### 1. Create a sample questionnaire:
```
Collection: questionnaires
Document ID: q1

{
  "id": "q1",
  "title": "Career Development Survey 2026",
  "description": "Help us understand your career journey and development",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "questions": [
    {
      "id": "q1_1",
      "title": "What was your original course/degree?",
      "type": "text",
      "required": true
    },
    {
      "id": "q1_2",
      "title": "What is your current job title?",
      "type": "text",
      "required": true
    },
    {
      "id": "q1_3",
      "title": "What field/industry are you working in?",
      "type": "text",
      "required": true
    },
    {
      "id": "q1_4",
      "title": "How closely related is your current job to your degree?",
      "type": "multipleChoice",
      "options": ["Highly Related", "Related", "Somewhat Related", "Not Related"],
      "required": true
    },
    {
      "id": "q1_5",
      "title": "Rate your job satisfaction",
      "type": "rating",
      "required": true
    }
  ]
}
```

#### 2. Create sample statistics:
```
Collection: statistics
Document ID: current

{
  "totalAlumni": 1500,
  "respondents": 450,
  "responseRate": 0.3,
  "lastUpdated": "2026-03-01T00:00:00Z",
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
    },
    {
      "courseName": "Business Administration",
      "count": 80,
      "percentage": 0.178
    },
    {
      "courseName": "Engineering",
      "count": 75,
      "percentage": 0.167
    }
  ],
  "relatednessStatistics": [
    {
      "category": "Highly Related",
      "count": 315,
      "percentage": 0.7
    },
    {
      "category": "Related",
      "count": 45,
      "percentage": 0.1
    },
    {
      "category": "Somewhat Related",
      "count": 45,
      "percentage": 0.1
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
      "jobTitles": ["Software Engineer", "IT Manager", "Developer", "Systems Analyst"]
    },
    {
      "fieldName": "Finance",
      "count": 120,
      "percentage": 0.267,
      "jobTitles": ["Accountant", "Financial Analyst", "Auditor"]
    },
    {
      "fieldName": "Healthcare",
      "count": 80,
      "percentage": 0.178,
      "jobTitles": ["Nurse", "Doctor", "Pharmacist"]
    },
    {
      "fieldName": "Education",
      "count": 50,
      "percentage": 0.111,
      "jobTitles": ["Teacher", "Professor", "Instructor"]
    }
  ]
}
```

### Step 7: Run the App

#### Android Emulator:
```bash
flutter emulators --launch Pixel_4_API_30
flutter run
```

#### iOS Simulator:
```bash
open -a Simulator
flutter run
```

#### Physical Device:
```bash
flutter devices  # List connected devices
flutter run -d <device-id>
```

### Step 8: Testing

#### Create Test Accounts:
1. Run the app
2. Sign up with test email: `test@baliuag.edu.ph`
3. Create other test accounts for trying out features

#### Test Key Features:
- [ ] Sign up and login
- [ ] Fill out questionnaire
- [ ] View statistics
- [ ] Browse participants
- [ ] Test dark mode toggle
- [ ] Change avatar
- [ ] Ask BUddy questions
- [ ] Delete account (with "delete" confirmation)

## Troubleshooting

### Firebase Connection Issues
```bash
flutter clean
flutter pub get
flutter run
```

### Missing google-services.json
- Download from Firebase Console
- Place in `android/app/`
- Run `flutter clean` and try again

### API Key Issues
- Verify API key in Firebase Console
- Check that APIs are enabled (Firestore, Authentication, Cloud Storage)

### iOS Pod Issues
```bash
cd ios
rm Podfile.lock
pod install
cd ..
flutter run
```

### Build Issues
```bash
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

## Important Notes

- **Never commit credentials** - Use environment variables or a secure vault
- **Test on real devices** before production
- **Review Firestore rules** before going live
- **Enable SSL certificate pinning** for production
- **Set up error logging** with Crashlytics for production

## Useful Commands

```bash
# Clean build
flutter clean

# Get packages
flutter pub get

# Build APK
flutter build apk --release

# Build app bundle
flutter build appbundle --release

# Build iOS
flutter build ios --release

# Run tests
flutter test

# Format code
dart format .

# Analyze code
dart analyze

# Upgrade packages
flutter pub upgrade
```

## Project Structure Reference

```
BU Alumni/
├── android/                    # Android-specific files
├── ios/                        # iOS-specific files
├── lib/
│   ├── main.dart              # Entry point
│   ├── firebase_options.dart  # Firebase config (UPDATE WITH CREDENTIALS)
│   ├── theme/
│   ├── models/
│   ├── services/
│   ├── providers/
│   ├── screens/
│   └── widgets/
├── test/                       # Test files
├── pubspec.yaml               # Dependencies
├── .gitignore                 # Git ignore rules
└── README.md                  # Documentation
```

## Next Steps

1. Set up CI/CD pipeline with GitHub Actions or similar
2. Set up crash reporting with Firebase Crashlytics
3. Configure analytics with Firebase Analytics
4. Set up automated testing
5. Document API endpoints if using Cloud Functions
6. Plan database backup strategy
7. Set up monitoring and alerts

## Support & Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Flutter Riverpod Documentation](https://riverpod.dev)

---

**For questions or issues, please contact the development team.**
