# BU Alumni Tracer - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Have Flutter SDK installed (`flutter --version` to check)
- Have Firebase account ready
- Have Google AI API key ready

### Quick Setup Steps

1. **Update Firebase Credentials**
   - Edit `lib/firebase_options.dart` with your Firebase project credentials
   - Can be found in Firebase Console → Project Settings

2. **Update Google AI Key**
   - Edit `lib/services/chatbot_service.dart` line with `const apiKey = 'YOUR_KEY'`
   - Get key from https://aistudio.google.com/app/apikey

3. **Install Dependencies**
   ```bash
   flutter pub get
   ```

4. **Run App**
   ```bash
   flutter run
   ```

## Key App Features

### Navigation
- **Questionnaires**: Fill out alumni surveys
- **Participants**: View other alumni profiles and career info
- **Statistics**: View graphs and analytics about alumni outcomes

### Settings
- **Dark Mode**: Toggle theme in settings
- **Avatar**: Change profile picture (long-press avatar icon)
- **Account**: Delete account (requires typing "delete" for confirmation)

### AI Chatbot (BUddy)
- Click the floating chat button to ask questions
- BUddy helps with app navigation and features

## Color Scheme
- Primary Green: `#006d1d`
- Secondary Green: `#4c992d`
- White: `#FFFFFF`

## Default Test Flow

1. **Sign Up**: Create account with test email
2. **Complete Survey**: Fill out available questionnaire
3. **View Stats**: See analytics on Statistics tab
4. **Browse**: Check Participants section
5. **Try Chat**: Ask BUddy a question
6. **Dark Mode**: Toggle in Settings

## Firestore Collections Setup

Minimum required for running:

```
questionnaires/q1/
├── id: "q1"
├── title: "Career Survey"
├── description: "Alumni career tracking"
├── isActive: true
└── questions: [...]

statistics/current/
├── totalAlumni: 1500
├── respondents: 450
├── responseRate: 0.3
└── [statisticsData]
```

See `SETUP.md` for full sample data.

## Common Issues

| Issue | Solution |
|-------|----------|
| Firebase not connecting | Check credentials in `firebase_options.dart` |
| BUddy not responding | Verify Google AI API key in `chatbot_service.dart` |
| App won't start | Run `flutter clean && flutter pub get` |
| No data showing | Check Firestore has data in collections |

## Build Commands

```bash
# Development
flutter run

# Production APK
flutter build apk --release

# Production App Bundle
flutter build appbundle --release

# iOS
flutter build ios --release
```

## File Locations for Configuration

- **Firebase**: `lib/firebase_options.dart`
- **Google AI**: `lib/services/chatbot_service.dart`
- **Theme Colors**: `lib/theme/app_theme.dart`
- **Font**: `assets/fonts/GoudyStd-Old-Style-Roman.ttf`

---

For detailed setup, see `SETUP.md`. For documentation, see `README.md`.
