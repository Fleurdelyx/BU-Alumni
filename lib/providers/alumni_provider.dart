import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alumnus.dart';
import '../models/course.dart';
import '../models/questionnaire.dart';
import '../services/firestore_service.dart';

// Alumni providers
final alumniProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream();
});

final completedSurveysProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream(surveyCompleted: true);
});

final pendingSurveysProvider = StreamProvider<List<Alumnus>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAllAlumniStream(surveyCompleted: false);
});

// Course providers
final coursesProvider = StreamProvider<List<Course>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getCoursesStream();
});

// Questionnaire providers
final questionnairesProvider = StreamProvider<List<Questionnaire>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getQuestionnairesStream();
});

// Alumnus-specific providers
final alumnusProvider =
    StreamProvider.family<Alumnus?, String>((ref, alumnusId) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAlumnusStream(alumnusId);
});

final alumnusResponsesProvider =
    StreamProvider.family<List<QuestionnaireResponse>, String>(
        (ref, alumnusId) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAlumnusResponsesStream(alumnusId);
});
