import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/alumnus.dart';
import '../models/course.dart';
import '../models/questionnaire.dart';
import '../models/statistics.dart';
import 'firestore_service.dart';

final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService(ref);
});

final syncStatusProvider =
    StateNotifierProvider<SyncStatusNotifier, SyncStatus>((ref) {
  return SyncStatusNotifier();
});

final connectionStatusProvider = StreamProvider<ConnectivityResult>((ref) {
  return Connectivity().onConnectivityChanged;
});

enum SyncState {
  idle,
  syncing,
  success,
  error,
}

class SyncStatus {
  final SyncState state;
  final String? message;
  final DateTime? lastSyncTime;

  const SyncStatus({
    required this.state,
    this.message,
    this.lastSyncTime,
  });

  SyncStatus copyWith({
    SyncState? state,
    String? message,
    DateTime? lastSyncTime,
  }) {
    return SyncStatus(
      state: state ?? this.state,
      message: message ?? this.message,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
    );
  }
}

class SyncStatusNotifier extends StateNotifier<SyncStatus> {
  SyncStatusNotifier() : super(const SyncStatus(state: SyncState.idle));

  void setSyncing(String message) {
    state = SyncStatus(state: SyncState.syncing, message: message);
  }

  void setSuccess(String message) {
    state = SyncStatus(
      state: SyncState.success,
      message: message,
      lastSyncTime: DateTime.now(),
    );
  }

  void setError(String message) {
    state = SyncStatus(state: SyncState.error, message: message);
  }

  void setIdle() {
    state = state.copyWith(state: SyncState.idle);
  }
}

class SyncService {
  final Ref _ref;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  SyncService(this._ref);

  /// Force refresh all data providers
  Future<void> syncAllData() async {
    final syncNotifier = _ref.read(syncStatusProvider.notifier);

    try {
      syncNotifier.setSyncing('Syncing all data...');

      // Check connectivity first
      final connectivity = await Connectivity().checkConnectivity();
      if (connectivity == ConnectivityResult.none) {
        throw Exception('No internet connection');
      }

      // Enable Firestore offline persistence
      await _enableOfflinePersistence();

      // Force refresh all data streams by invalidating providers
      _ref.invalidate(alumniProvider);
      _ref.invalidate(allAlumniProvider);
      _ref.invalidate(allUsersProvider);
      _ref.invalidate(coursesProvider);
      _ref.invalidate(questionnairesProvider);
      _ref.invalidate(completedSurveysProvider);
      _ref.invalidate(pendingSurveysProvider);
      _ref.invalidate(statisticsProvider);

      // Wait for data to be fetched
      await Future.delayed(const Duration(seconds: 2));

      // Verify data sync by checking collections
      await _verifyDataSync();

      syncNotifier.setSuccess('Data synced successfully');
    } catch (e) {
      print('[SYNC] Error syncing data: $e');
      syncNotifier.setError('Sync failed: ${e.toString()}');
      rethrow;
    }
  }

  /// Enable Firestore offline persistence
  Future<void> _enableOfflinePersistence() async {
    try {
      await _firestore.enablePersistence();
      print('[SYNC] Firestore offline persistence enabled');
    } catch (e) {
      // Persistence might already be enabled
      print('[SYNC] Offline persistence setup: $e');
    }
  }

  /// Verify that data sync is working by checking collection counts
  Future<void> _verifyDataSync() async {
    final alumniCount = await _firestore.collection('alumni').count().get();
    final coursesCount = await _firestore.collection('courses').count().get();
    final questionnairesCount =
        await _firestore.collection('questionnaires').count().get();

    print('[SYNC] Data verification:');
    print('  - Alumni: ${alumniCount.count}');
    print('  - Courses: ${coursesCount.count}');
    print('  - Questionnaires: ${questionnairesCount.count}');

    if (alumniCount.count == 0 &&
        coursesCount.count == 0 &&
        questionnairesCount.count == 0) {
      throw Exception(
          'No data found in Firebase - check connection and permissions');
    }
  }

  /// Sync specific collection
  Future<void> syncCollection(String collection) async {
    final syncNotifier = _ref.read(syncStatusProvider.notifier);

    try {
      syncNotifier.setSyncing('Syncing $collection...');

      // Force refresh specific data based on collection
      switch (collection) {
        case 'alumni':
          _ref.invalidate(alumniProvider);
          _ref.invalidate(allAlumniProvider);
          _ref.invalidate(allUsersProvider);
          break;
        case 'courses':
          _ref.invalidate(coursesProvider);
          break;
        case 'questionnaires':
          _ref.invalidate(questionnairesProvider);
          break;
        case 'statistics':
          _ref.invalidate(statisticsProvider);
          break;
      }

      await Future.delayed(const Duration(seconds: 1));
      syncNotifier.setSuccess('$collection synced successfully');
    } catch (e) {
      syncNotifier.setError('Failed to sync $collection: ${e.toString()}');
      rethrow;
    }
  }

  /// Check Firebase connection status
  Future<bool> checkFirebaseConnection() async {
    try {
      // Try to read a simple document to test connection
      await _firestore.collection('_connection_test').doc('test').get();
      return true;
    } catch (e) {
      print('[SYNC] Firebase connection test failed: $e');
      return false;
    }
  }

  /// Force refresh providers (useful for pull-to-refresh)
  void refreshProviders() {
    _ref.invalidate(alumniProvider);
    _ref.invalidate(allAlumniProvider);
    _ref.invalidate(allUsersProvider);
    _ref.invalidate(coursesProvider);
    _ref.invalidate(questionnairesProvider);
    _ref.invalidate(completedSurveysProvider);
    _ref.invalidate(pendingSurveysProvider);
    _ref.invalidate(statisticsProvider);

    print('[SYNC] All data providers refreshed');
  }

  /// Clear offline cache and force fresh data
  Future<void> clearCacheAndSync() async {
    final syncNotifier = _ref.read(syncStatusProvider.notifier);

    try {
      syncNotifier.setSyncing('Clearing cache and syncing...');

      // Clear Firestore cache
      await _firestore.clearPersistence();

      // Re-enable persistence
      await _enableOfflinePersistence();

      // Force refresh all data
      await syncAllData();
    } catch (e) {
      syncNotifier.setError('Failed to clear cache: ${e.toString()}');
      rethrow;
    }
  }
}

// Provider aliases for easy access
final alumniProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream();
});

final allAlumniProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream();
});

final allUsersProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream();
});

final coursesProvider = StreamProvider<List<Course>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getCoursesStream();
});

final questionnairesProvider = StreamProvider<List<Questionnaire>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getQuestionnairesStream();
});

final completedSurveysProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream(surveyCompleted: true);
});

final pendingSurveysProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream(surveyCompleted: false);
});

final statisticsProvider = StreamProvider<Statistics>((ref) async* {
  final alumniAsync = ref.watch(allAlumniProvider);

  yield* alumniAsync.when(
    data: (alumni) {
      // Compute statistics from alumni data
      final totalAlumni = alumni.length;
      final completedSurveys = alumni.where((a) => a.surveyCompleted).length;

      // Group by course
      final courseGroups = <String, int>{};
      for (final alumnus in alumni) {
        courseGroups[alumnus.course] = (courseGroups[alumnus.course] ?? 0) + 1;
      }

      final courseStatistics = courseGroups.entries.map((entry) {
        return CourseStatistic(
          courseName: entry.key,
          count: entry.value,
          percentage: totalAlumni > 0 ? (entry.value / totalAlumni) * 100 : 0,
        );
      }).toList();

      // Group by course relatedness
      final relatednessGroups = <String, int>{};
      for (final alumnus in alumni) {
        relatednessGroups[alumnus.isCourseRelated] =
            (relatednessGroups[alumnus.isCourseRelated] ?? 0) + 1;
      }

      final relatednessStatistics = relatednessGroups.entries.map((entry) {
        return RelatednessStatistic(
          category: entry.key,
          count: entry.value,
          percentage: totalAlumni > 0 ? (entry.value / totalAlumni) * 100 : 0,
        );
      }).toList();

      final statistics = Statistics(
        totalAlumni: totalAlumni,
        respondents: completedSurveys,
        responseRate: totalAlumni > 0 ? completedSurveys / totalAlumni : 0.0,
        courseStatistics: courseStatistics,
        relatednessStatistics: relatednessStatistics,
        fieldStatistics: [], // Empty for now
        lastUpdated: DateTime.now(),
      );

      return Stream.value(statistics);
    },
    loading: () => const Stream<Statistics>.empty(),
    error: (error, stack) => Stream.error(error, stack),
  );
});
