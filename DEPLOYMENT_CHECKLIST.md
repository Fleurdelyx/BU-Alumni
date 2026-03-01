# Pre-Deployment Checklist

## Configuration Tasks

### Firebase Setup
- [/] Create Firebase project: `bu-alumni-tracer`
- [ ] Copy Android API key to `lib/firebase_options.dart`
- [ ] Copy iOS API key to `lib/firebase_options.dart`
- [ ] Download and place `google-services.json` in `android/app/`
- [ ] Download and place `GoogleService-Info.plist` in `ios/Runner/`
- [ ] Create Firestore collections (see SETUP.md)
- [ ] Upload Firestore Security Rules (see SETUP.md)
- [ ] Configure Cloud Storage bucket
- [ ] Set up Firebase Cloud Functions (optional)

### Google AI Configuration
- [/] Get API key from https://aistudio.google.com/app/apikey
- [/] Update `lib/services/chatbot_service.dart` with API key
- [ ] Test chatbot responses
- [ ] Configure API rate limits if needed

### Assets & Branding
- [/] Download/create Baliuag University logo
- [/] Place in `assets/logos/`
- [/] Download Goudy Old Style Roman font
- [/] Place in `assets/fonts/GoudyStd-Old-Style-Roman.ttf`
- [/] Create app icon (192x192px minimum)
- [ ] Create app splash screen
- [ ] Prepare app store screenshots

### Android Configuration
- [ ] Update package name from `com.baliuag.alumni_tracer` to actual package
- [ ] Update app name in `AndroidManifest.xml`
- [ ] Configure signing key for release builds
- [ ] Update minimum SDK version if needed
- [ ] Configure build gradle with Firebase plugin
- [ ] Add necessary permissions to manifest

### iOS Configuration
- [ ] Update Bundle ID to match Firebase config
- [ ] Update app name in `Info.plist`
- [ ] Configure signing team ID
- [ ] Setup provisioning profiles
- [ ] Update minimum iOS version
- [ ] Configure capabilities (if needed)

## Code Tasks

### Security
- [ ] Remove all placeholder/test credentials
- [ ] Remove debug print statements
- [ ] Enable ProGuard/R8 for Android
- [ ] Enable bitcode for iOS
- [ ] Review Firestore Security Rules
- [ ] Implement rate limiting
- [ ] Add input validation on all forms

### Testing
- [ ] Test on Android device (API 24+)
- [ ] Test on iOS device (iOS 12+)
- [ ] Test sign up flow
- [ ] Test sign in flow
- [ ] Test questionnaire submission
- [ ] Test statistics loading
- [ ] Test participants list
- [ ] Test dark mode toggle
- [ ] Test avatar upload
- [ ] Test account deletion
- [ ] Test chatbot responses
- [ ] Test error handling
- [ ] Test offline behavior

### Analytics & Monitoring
- [ ] Set up Firebase Analytics
- [ ] Implement Crashlytics
- [ ] Add custom events
- [ ] Configure error logging
- [ ] Set up performance monitoring
- [ ] Configure alerts

### Documentation
- [ ] Update README.md with real project info
- [ ] Create user manual/guide
- [ ] Document API endpoints (if using Cloud Functions)
- [ ] Create admin guide for statistics management
- [ ] Add troubleshooting guide

## Build & Release

### Pre-Release Build
- [ ] Generate release keystore for Android
- [ ] Configure release build signing
- [ ] Test release APK on actual devices
- [ ] Test release App Bundle
- [ ] Build for iOS with release provisioning

### Store Submission
- [ ] Create Google Play Developer account
- [ ] Create Apple Developer account
- [ ] Prepare store listing
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Prepare app description and screenshots
- [ ] Get necessary approvals

### Final Checks
- [ ] Version code: 1
- [ ] Version name: 1.0.0
- [ ] Minimum API version set correctly
- [ ] All strings externalized (for i18n)
- [ ] All hardcoded colors use theme
- [ ] No sensitive data in code
- [ ] SDK paths configured correctly

## Deployment

### Android Store
- [ ] Build AAB (App Bundle)
- [ ] Submit to Google Play Console
- [ ] Complete store listing
- [ ] Set pricing and distribution
- [ ] Submit for review
- [ ] Monitor review status

### iOS Store
- [ ] Build for iOS
- [ ] Create TestFlight build
- [ ] Submit to App Store Connect
- [ ] Complete app information
- [ ] Add screenshots and descriptions
- [ ] Submit for review
- [ ] Monitor review status

## Post-Deployment

### Monitoring
- [ ] Monitor crash reports
- [ ] Check user feedback
- [ ] Monitor performance metrics
- [ ] Monitor error rates
- [ ] Track usage statistics

### Support
- [ ] Set up support email
- [ ] Monitor and respond to reviews
- [ ] Track feature requests
- [ ] Plan updates based on feedback

### Maintenance
- [ ] Schedule dependency updates
- [ ] Plan security patches
- [ ] Monitor Firebase usage/costs
- [ ] Regular backups
- [ ] Database optimization

## Marketing & Launch

### Pre-Launch
- [ ] Create marketing materials
- [ ] Plan launch announcement
- [ ] Reach out to BU alumni network
- [ ] Prepare social media posts
- [ ] Create email campaign

### Launch
- [ ] Soft launch to beta testers
- [ ] Gather feedback
- [ ] Make adjustments if needed
- [ ] Full launch announcement
- [ ] Push marketing campaign

### Ongoing
- [ ] Regular feature updates
- [ ] Performance improvements
- [ ] User experience enhancements
- [ ] New survey rounds
- [ ] Statistics updates

## Important Links

- Firebase Console: https://console.firebase.google.com
- Google AI Studio: https://aistudio.google.com/app/apikey
- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com
- Flutter Docs: https://flutter.dev/docs

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0   | 2026-03-01 | Initial release |

## Contact & Support

For questions or issues:
- Email: [development-team@baliuag.edu.ph]
- Internal Wiki: [link to internal documentation]
- Issue Tracker: [link to issue tracking system]

---

**Remember:** Never commit credentials, API keys, or sensitive data to version control. Use environment variables or secure vaults for production configurations.
