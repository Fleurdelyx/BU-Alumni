import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_theme.dart';
import 'questionnaires_section.dart';
import 'participants_section.dart';
import 'statistics_section.dart';
import '../../widgets/chatbot_widget.dart';
import '../../widgets/sync_widgets.dart';
import '../../services/firebase_sync_service.dart';
import '../../services/auth_service.dart';
import '../../providers/theme_provider.dart';
import '../../providers/user_provider.dart';
import '../settings/settings_screen.dart';
import '../auth/login_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDarkMode = ref.watch(darkModeProvider);
    final currentUserAsync = ref.watch(currentUserProvider);

    final screens = <Widget>[
      RefreshableSyncWidget(
        child: QuestionnairesSection(),
      ),
      RefreshableSyncWidget(
        child: ParticipantsSection(),
      ),
      RefreshableSyncWidget(
        child: StatisticsSection(),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.school, color: AppTheme.white, size: 28),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'BU Alumni Tracer',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: AppTheme.white,
                        ),
                  ),
                  // Sync status indicator
                  const SyncStatusIndicator(),
                ],
              ),
            ),
            // User profile indicator
            currentUserAsync.when(
              data: (user) => user != null
                  ? Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: CircleAvatar(
                        radius: 16,
                        backgroundColor: AppTheme.white.withOpacity(0.2),
                        child: Text(
                          user.name.isNotEmpty
                              ? user.name[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                            color: AppTheme.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        ),
        actions: [
          // Theme toggle button
          IconButton(
            icon: Icon(isDarkMode ? Icons.light_mode : Icons.dark_mode),
            onPressed: () {
              ref.read(darkModeProvider.notifier).toggleDarkMode();
            },
            tooltip:
                isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          ),
          // Sync button
          const SyncButton(
            showText: false,
            tooltip: 'Sync data with Firebase',
          ),
          // Profile/Logout menu
          PopupMenuButton<String>(
            icon: const Icon(Icons.account_circle),
            tooltip: 'Account Menu',
            onSelected: (value) {
              switch (value) {
                case 'settings':
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  );
                  break;
                case 'logout':
                  _showLogoutDialog(context);
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'settings',
                child: ListTile(
                  leading: Icon(Icons.settings),
                  title: Text('Settings'),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: ListTile(
                  leading: Icon(Icons.logout, color: AppTheme.errorRed),
                  title: Text('Sign Out',
                      style: TextStyle(color: AppTheme.errorRed)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              _showSyncMenu(context);
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Sync status banner (shows when offline or error)
          const SyncStatusBanner(),
          Expanded(
            child: screens[_selectedIndex],
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: isDarkMode ? AppTheme.darkSurface : AppTheme.white,
        selectedItemColor:
            isDarkMode ? AppTheme.secondaryGreen : AppTheme.primaryGreen,
        unselectedItemColor:
            isDarkMode ? AppTheme.darkGrey : const Color(0xFFBDBDBD),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment),
            label: 'Questionnaires',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Participants',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart),
            label: 'Statistics',
          ),
        ],
        onTap: (index) {
          setState(() => _selectedIndex = index);
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            builder: (_) => const ChatbotWidget(),
          );
        },
        backgroundColor: AppTheme.secondaryGreen,
        child: const Icon(Icons.chat, color: AppTheme.white),
      ),
    );
  }

  void _showSyncMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Data Sync Options',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              Consumer(
                builder: (context, ref, child) {
                  final syncService = ref.read(syncServiceProvider);
                  final syncStatus = ref.watch(syncStatusProvider);

                  return Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.sync),
                        title: const Text('Sync All Data'),
                        subtitle: const Text('Refresh all data from Firebase'),
                        onTap: syncStatus.state == SyncState.syncing
                            ? null
                            : () {
                                Navigator.pop(context);
                                syncService.syncAllData();
                              },
                      ),
                      ListTile(
                        leading: const Icon(Icons.people),
                        title: const Text('Sync Participants'),
                        subtitle: const Text('Refresh participant data only'),
                        onTap: syncStatus.state == SyncState.syncing
                            ? null
                            : () {
                                Navigator.pop(context);
                                syncService.syncCollection('alumni');
                              },
                      ),
                      ListTile(
                        leading: const Icon(Icons.bar_chart),
                        title: const Text('Sync Statistics'),
                        subtitle: const Text('Refresh statistics data only'),
                        onTap: syncStatus.state == SyncState.syncing
                            ? null
                            : () {
                                Navigator.pop(context);
                                syncService.syncCollection('statistics');
                              },
                      ),
                      ListTile(
                        leading: const Icon(Icons.info_outline),
                        title: const Text('Detailed Sync Status'),
                        subtitle: const Text('View detailed sync information'),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const DetailedSyncStatusPage(),
                            ),
                          );
                        },
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showLogoutDialog(BuildContext context) async {
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
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.errorRed,
            ),
            onPressed: () => Navigator.pop(context, true),
            child:
                const Text('Sign Out', style: TextStyle(color: AppTheme.white)),
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
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error signing out: ${e.toString()}'),
              backgroundColor: AppTheme.errorRed,
            ),
          );
        }
      }
    }
  }
}
