import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final darkModeProvider = StateNotifierProvider<DarkModeNotifier, bool>((ref) {
  return DarkModeNotifier();
});

class DarkModeNotifier extends StateNotifier<bool> {
  static const String _darkModeKey = 'darkMode';

  DarkModeNotifier() : super(false) {
    _loadDarkMode();
  }

  Future<void> _loadDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    state = prefs.getBool(_darkModeKey) ?? false;
  }

  Future<void> toggleDarkMode() async {
    state = !state;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_darkModeKey, state);
  }

  Future<void> setDarkMode(bool isDark) async {
    state = isDark;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_darkModeKey, isDark);
  }
}
