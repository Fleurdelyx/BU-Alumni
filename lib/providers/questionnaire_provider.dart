import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/questionnaire.dart';
import '../services/firestore_service.dart';

final questionnairesProvider = StreamProvider<List<Questionnaire>>((ref) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getQuestionnairesStream();
});

final userResponsesProvider =
    StreamProvider.family<List<QuestionnaireResponse>, String>(
        (ref, alumnusId) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAlumnusResponsesStream(alumnusId);
});
