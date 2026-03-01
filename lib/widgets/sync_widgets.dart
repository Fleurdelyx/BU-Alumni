import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../services/firebase_sync_service.dart';
import '../theme/app_theme.dart';

class SyncStatusIndicator extends ConsumerWidget {
  const SyncStatusIndicator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncStatus = ref.watch(syncStatusProvider);
    final connectionStatus = ref.watch(connectionStatusProvider);

    return connectionStatus.when(
      data: (connectivity) {
        final isConnected = connectivity != ConnectivityResult.none;

        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Connection status indicator
            Icon(
              isConnected ? Icons.wifi : Icons.wifi_off,
              size: 16,
              color: isConnected ? AppTheme.primaryGreen : AppTheme.errorRed,
            ),
            const SizedBox(width: 8),

            // Sync status indicator
            if (syncStatus.state == SyncState.syncing)
              const SizedBox(
                height: 16,
                width: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              Icon(
                _getSyncIcon(syncStatus.state),
                size: 16,
                color: _getSyncColor(syncStatus.state),
              ),

            const SizedBox(width: 4),

            // Status text
            Text(
              _getStatusText(syncStatus, isConnected),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: _getSyncColor(syncStatus.state),
                  ),
            ),
          ],
        );
      },
      loading: () => const SizedBox(
        height: 16,
        width: 16,
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
      error: (_, __) => const Icon(
        Icons.error_outline,
        size: 16,
        color: AppTheme.errorRed,
      ),
    );
  }

  IconData _getSyncIcon(SyncState state) {
    switch (state) {
      case SyncState.idle:
        return Icons.sync;
      case SyncState.syncing:
        return Icons.sync;
      case SyncState.success:
        return Icons.check_circle_outline;
      case SyncState.error:
        return Icons.error_outline;
    }
  }

  Color _getSyncColor(SyncState state) {
    switch (state) {
      case SyncState.idle:
        return AppTheme.darkGrey;
      case SyncState.syncing:
        return AppTheme.primaryGreen;
      case SyncState.success:
        return AppTheme.successGreen;
      case SyncState.error:
        return AppTheme.errorRed;
    }
  }

  String _getStatusText(SyncStatus status, bool isConnected) {
    if (!isConnected) return 'Offline';

    switch (status.state) {
      case SyncState.idle:
        return status.lastSyncTime != null
            ? 'Synced ${_formatTime(status.lastSyncTime!)}'
            : 'Ready';
      case SyncState.syncing:
        return status.message ?? 'Syncing...';
      case SyncState.success:
        return 'Synced ${_formatTime(status.lastSyncTime!)}';
      case SyncState.error:
        return 'Sync failed';
    }
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inMinutes < 1) return 'now';
    if (difference.inMinutes < 60) return '${difference.inMinutes}m ago';
    if (difference.inHours < 24) return '${difference.inHours}h ago';
    return '${difference.inDays}d ago';
  }
}

class SyncButton extends ConsumerWidget {
  final String? tooltip;
  final bool showIcon;
  final bool showText;

  const SyncButton({
    super.key,
    this.tooltip,
    this.showIcon = true,
    this.showText = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncStatus = ref.watch(syncStatusProvider);
    final syncService = ref.read(syncServiceProvider);

    return Tooltip(
      message: tooltip ?? 'Sync data with Firebase',
      child: TextButton.icon(
        onPressed: syncStatus.state == SyncState.syncing
            ? null
            : () => _handleSync(syncService, ref),
        icon: showIcon
            ? (syncStatus.state == SyncState.syncing
                ? const SizedBox(
                    height: 16,
                    width: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.sync))
            : const SizedBox.shrink(),
        label: showText
            ? Text(
                syncStatus.state == SyncState.syncing ? 'Syncing...' : 'Sync')
            : const SizedBox.shrink(),
      ),
    );
  }

  Future<void> _handleSync(SyncService syncService, WidgetRef ref) async {
    try {
      await syncService.syncAllData();
    } catch (e) {
      // Error is already handled by the sync service
      print('[SYNC_BUTTON] Sync error: $e');
    }
  }
}

class RefreshableSyncWidget extends ConsumerWidget {
  final Widget child;

  const RefreshableSyncWidget({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncService = ref.read(syncServiceProvider);

    return RefreshIndicator(
      onRefresh: () async {
        await syncService.syncAllData();
      },
      child: child,
    );
  }
}

class SyncStatusBanner extends ConsumerWidget {
  const SyncStatusBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncStatus = ref.watch(syncStatusProvider);
    final connectionStatus = ref.watch(connectionStatusProvider);

    return connectionStatus.when(
      data: (connectivity) {
        final isConnected = connectivity != ConnectivityResult.none;

        // Only show banner for errors or when offline
        if (syncStatus.state == SyncState.error || !isConnected) {
          return Material(
            elevation: 0,
            color: !isConnected
                ? Colors.orange.shade100
                : AppTheme.errorRed.withOpacity(0.1),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                children: [
                  Icon(
                    !isConnected ? Icons.wifi_off : Icons.sync_problem,
                    color: !isConnected ? Colors.orange : AppTheme.errorRed,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      !isConnected
                          ? 'You\'re offline. Data may not be up to date.'
                          : syncStatus.message ?? 'Sync failed. Tap to retry.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                  if (syncStatus.state == SyncState.error)
                    TextButton(
                      onPressed: () =>
                          ref.read(syncServiceProvider).syncAllData(),
                      child: const Text('Retry'),
                    ),
                ],
              ),
            ),
          );
        }

        return const SizedBox.shrink();
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}

class DetailedSyncStatusPage extends ConsumerWidget {
  const DetailedSyncStatusPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncStatus = ref.watch(syncStatusProvider);
    final connectionStatus = ref.watch(connectionStatusProvider);
    final syncService = ref.read(syncServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sync Status'),
        actions: [
          IconButton(
            onPressed: syncStatus.state == SyncState.syncing
                ? null
                : () => syncService.syncAllData(),
            icon: syncStatus.state == SyncState.syncing
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.sync),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Connection Status
            Card(
              child: ListTile(
                leading: connectionStatus.when(
                  data: (connectivity) => Icon(
                    connectivity != ConnectivityResult.none
                        ? Icons.wifi
                        : Icons.wifi_off,
                    color: connectivity != ConnectivityResult.none
                        ? AppTheme.successGreen
                        : AppTheme.errorRed,
                  ),
                  loading: () => const CircularProgressIndicator(),
                  error: (_, __) =>
                      const Icon(Icons.error, color: AppTheme.errorRed),
                ),
                title: const Text('Connection Status'),
                subtitle: connectionStatus.when(
                  data: (connectivity) => Text(
                    connectivity != ConnectivityResult.none
                        ? 'Connected'
                        : 'Offline',
                  ),
                  loading: () => const Text('Checking...'),
                  error: (_, __) => const Text('Error checking connection'),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Sync Status
            Card(
              child: ListTile(
                leading: syncStatus.state == SyncState.syncing
                    ? const CircularProgressIndicator()
                    : Icon(
                        _getSyncIcon(syncStatus.state),
                        color: _getSyncColor(syncStatus.state),
                      ),
                title: const Text('Data Sync Status'),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_getSyncStateText(syncStatus.state)),
                    if (syncStatus.message != null)
                      Text(syncStatus.message!,
                          style: Theme.of(context).textTheme.bodySmall),
                    if (syncStatus.lastSyncTime != null)
                      Text(
                        'Last synced: ${syncStatus.lastSyncTime}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Manual Sync Actions
            const Text(
              'Manual Sync Actions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            ListTile(
              leading: const Icon(Icons.sync),
              title: const Text('Sync All Data'),
              subtitle: const Text('Refresh all collections from Firebase'),
              onTap: syncStatus.state == SyncState.syncing
                  ? null
                  : () => syncService.syncAllData(),
            ),

            ListTile(
              leading: const Icon(Icons.people),
              title: const Text('Sync Alumni Data'),
              subtitle: const Text('Refresh only alumni and participant data'),
              onTap: syncStatus.state == SyncState.syncing
                  ? null
                  : () => syncService.syncCollection('alumni'),
            ),

            ListTile(
              leading: const Icon(Icons.bar_chart),
              title: const Text('Sync Statistics'),
              subtitle: const Text('Refresh statistics and analytics data'),
              onTap: syncStatus.state == SyncState.syncing
                  ? null
                  : () => syncService.syncCollection('statistics'),
            ),

            ListTile(
              leading: const Icon(Icons.clear_all),
              title: const Text('Clear Cache & Sync'),
              subtitle: const Text('Clear offline cache and fetch fresh data'),
              onTap: syncStatus.state == SyncState.syncing
                  ? null
                  : () => syncService.clearCacheAndSync(),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getSyncIcon(SyncState state) {
    switch (state) {
      case SyncState.idle:
        return Icons.sync;
      case SyncState.syncing:
        return Icons.sync;
      case SyncState.success:
        return Icons.check_circle;
      case SyncState.error:
        return Icons.error;
    }
  }

  Color _getSyncColor(SyncState state) {
    switch (state) {
      case SyncState.idle:
        return AppTheme.darkGrey;
      case SyncState.syncing:
        return AppTheme.primaryGreen;
      case SyncState.success:
        return AppTheme.successGreen;
      case SyncState.error:
        return AppTheme.errorRed;
    }
  }

  String _getSyncStateText(SyncState state) {
    switch (state) {
      case SyncState.idle:
        return 'Ready to sync';
      case SyncState.syncing:
        return 'Syncing data...';
      case SyncState.success:
        return 'Data is up to date';
      case SyncState.error:
        return 'Sync failed';
    }
  }
}
