import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/theme_provider.dart';
import '../../providers/user_provider.dart';
import '../../services/auth_service.dart';
import '../../services/firestore_service.dart';
import '../../theme/app_theme.dart';
import '../auth/login_screen.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final isDarkMode = ref.watch(darkModeProvider);
    final currentUserAsync = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: currentUserAsync.when(
        data: (user) {
          if (user == null) {
            return const Center(
              child: Text('User not found'),
            );
          }

          return ListView(
            children: [
              // Profile Section
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: AppTheme.secondaryGreen,
                          child: user.avatarUrl != null
                              ? ClipOval(
                                  child: Image.network(
                                    user.avatarUrl!,
                                    fit: BoxFit.cover,
                                  ),
                                )
                              : Text(
                                  user.name[0],
                                  style: const TextStyle(
                                    color: AppTheme.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 40,
                                  ),
                                ),
                        ),
                        GestureDetector(
                          onTap: _isLoading ? null : () => _changeAvatar(user),
                          child: const CircleAvatar(
                            radius: 16,
                            backgroundColor: AppTheme.primaryGreen,
                            child: Icon(
                              Icons.camera_alt,
                              color: AppTheme.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user.name,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    Text(
                      user.email,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              const Divider(),

              // Appearance Settings
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Appearance',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),

              ListTile(
                leading: Icon(
                  isDarkMode ? Icons.dark_mode : Icons.light_mode,
                  color: isDarkMode ? Colors.orange : Colors.yellow,
                ),
                title: const Text('Dark Mode'),
                subtitle: Text(isDarkMode
                    ? 'Dark theme is enabled'
                    : 'Light theme is enabled'),
                trailing: Switch(
                  value: isDarkMode,
                  onChanged: (value) async {
                    await ref
                        .read(darkModeProvider.notifier)
                        .setDarkMode(value);
                  },
                ),
              ),
              const Divider(),

              // Preferences
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Preferences',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),

              ListTile(
                leading: const Icon(Icons.privacy_tip),
                title: const Text('Privacy Policy'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  _showSnackBar('Privacy Policy', 'Privacy policy coming soon');
                },
              ),

              ListTile(
                leading: const Icon(Icons.description),
                title: const Text('Terms of Service'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  _showSnackBar(
                      'Terms of Service', 'Terms of Service coming soon');
                },
              ),

              ListTile(
                leading: const Icon(Icons.info),
                title: const Text('About'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  _showAboutDialog(context);
                },
              ),
              const Divider(),

              // Account Section
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Account',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),

              ListTile(
                leading: const Icon(Icons.security),
                title: const Text('Change Password'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: _isLoading ? null : _changePassword,
              ),

              ListTile(
                leading: const Icon(
                  Icons.delete,
                  color: AppTheme.errorRed,
                ),
                title: const Text(
                  'Delete Account',
                  style: TextStyle(color: AppTheme.errorRed),
                ),
                trailing: const Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: AppTheme.errorRed,
                ),
                onTap: _isLoading ? null : _deleteAccount,
              ),

              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Sign Out'),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: _isLoading ? null : _signOut,
              ),

              const SizedBox(height: 32),
            ],
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 48,
                color: AppTheme.errorRed,
              ),
              const SizedBox(height: 16),
              Text(
                'Error loading user data',
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _changeAvatar(dynamic user) async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() => _isLoading = true);
      try {
        // In a real app, you would upload to Firebase Storage
        // and get a URL. For now, we'll just store the path.
        _showSnackBar('Success', 'Avatar updated (demo mode)');
      } catch (e) {
        _showSnackBar('Error', 'Failed to update avatar');
      } finally {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    }
  }

  void _changePassword() {
    final password = TextEditingController();
    final newPassword = TextEditingController();
    final confirmPassword = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: password,
              decoration: const InputDecoration(
                labelText: 'Current Password',
              ),
              obscureText: true,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: newPassword,
              decoration: const InputDecoration(
                labelText: 'New Password',
              ),
              obscureText: true,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: confirmPassword,
              decoration: const InputDecoration(
                labelText: 'Confirm Password',
              ),
              obscureText: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (newPassword.text != confirmPassword.text) {
                _showSnackBar('Error', 'Passwords do not match');
                return;
              }

              try {
                final authService = ref.read(authServiceProvider);
                await authService.changePassword(
                  currentPassword: password.text,
                  newPassword: newPassword.text,
                );
                if (mounted) {
                  Navigator.pop(context);
                  _showSnackBar('Success', 'Password changed successfully');
                }
              } catch (e) {
                _showSnackBar('Error', e.toString());
              }
            },
            child: const Text('Change'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteAccount() async {
    final deleteConfirmation = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'This action cannot be undone. All your data will be permanently deleted.',
              style: TextStyle(color: AppTheme.errorRed),
            ),
            const SizedBox(height: 16),
            const Text('Type "delete" to confirm:'),
            const SizedBox(height: 12),
            TextField(
              controller: deleteConfirmation,
              decoration: const InputDecoration(
                labelText: 'Confirmation',
                hintText: 'delete',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.errorRed,
            ),
            onPressed: deleteConfirmation.text == 'delete'
                ? () async {
                    try {
                      setState(() => _isLoading = true);
                      final authService = ref.read(authServiceProvider);
                      final firestoreService =
                          ref.read(firestoreServiceProvider);
                      final userId = authService.getCurrentUserId();

                      // Find the Alumnus by userId, then delete it
                      if (userId != null) {
                        final alumnus =
                            await firestoreService.getAlumnusByUserId(userId);
                        if (alumnus != null) {
                          await firestoreService.deleteAlumnus(alumnus.id);
                        }
                      }

                      if (mounted) {
                        Navigator.pop(context);
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LoginScreen(),
                          ),
                          (route) => false,
                        );
                      }
                    } catch (e) {
                      _showSnackBar('Error', e.toString());
                    } finally {
                      if (mounted) {
                        setState(() => _isLoading = false);
                      }
                    }
                  }
                : null,
            child: const Text('Delete Permanently'),
          ),
        ],
      ),
    );
  }

  Future<void> _signOut() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final authService = ref.read(authServiceProvider);
        await authService.signOut();

        if (mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const LoginScreen()),
            (route) => false,
          );
        }
      } catch (e) {
        _showSnackBar('Error', e.toString());
      }
    }
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'BU Alumni Tracer',
      applicationVersion: '1.0.0',
      applicationLegalese: '© 2026 Baliuag University',
      children: [
        const Text(
          'A comprehensive graduate tracer study application for tracking alumni career development and outcomes.',
        ),
      ],
    );
  }

  void _showSnackBar(String title, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(message),
          ],
        ),
      ),
    );
  }
}
