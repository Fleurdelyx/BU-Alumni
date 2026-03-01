import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'firebase_options.dart';
import 'theme/app_theme.dart';
import 'providers/theme_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'services/auth_service.dart';
import 'services/firestore_seed.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    // Initialize Firebase only if not already initialized
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      print('[MAIN] Firebase initialized successfully');
    } else {
      print('[MAIN] Firebase already initialized, using existing instance');
    }

    // Seed database with test data on first run
    try {
      await FirestoreSeed.seedDatabase();
      print('[MAIN] Database seeding completed');
    } catch (e) {
      print('[MAIN] Database seeding error: $e');
    }
  } catch (e) {
    print('[MAIN] Firebase initialization error: $e');
  }
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(darkModeProvider);
    final authService = ref.watch(authServiceProvider);

    return MaterialApp(
      title: 'BU Alumni Tracer',
      debugShowCheckedModeBanner: false,
      theme: isDarkMode ? AppTheme.darkTheme : AppTheme.lightTheme,
      home: authService.user != null ? const HomeScreen() : const LoginScreen(),
    );
  }
}
