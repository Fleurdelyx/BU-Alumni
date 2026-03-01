import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alumnus.dart';
import '../models/statistics.dart';
import '../services/firestore_service.dart';

// Statistics are now derived from alumni data
final allAlumniProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream();
});

// Backwards compatibility: allUsersProvider returns the same data as allAlumniProvider
final allUsersProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream();
});

// Derive statistics from alumni data
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

      // Group by employment status
      final jobFieldGroups = <String, int>{};
      for (final alumnus in alumni) {
        jobFieldGroups[alumnus.employmentStatus] =
            (jobFieldGroups[alumnus.employmentStatus] ?? 0) + 1;
      }

      final jobFieldStatistics = jobFieldGroups.entries.map((entry) {
        return JobFieldStatistic(
          fieldName: entry.key,
          count: entry.value,
          percentage: totalAlumni > 0 ? (entry.value / totalAlumni) * 100 : 0,
          jobTitles: [], // Empty for now, can be populated later if needed
        );
      }).toList();

      final statistics = Statistics(
        totalAlumni: totalAlumni,
        respondents: completedSurveys,
        responseRate:
            totalAlumni > 0 ? (completedSurveys / totalAlumni) * 100 : 0,
        courseStatistics: courseStatistics,
        relatednessStatistics: relatednessStatistics,
        fieldStatistics: jobFieldStatistics,
        lastUpdated: DateTime.now(),
      );

      return Stream.value(statistics);
    },
    loading: () => const Stream.empty(),
    error: (err, stack) => Stream.error(err, stack),
  );
});
