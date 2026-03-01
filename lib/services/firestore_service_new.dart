import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alumnus.dart';
import '../models/course.dart';
import '../models/questionnaire.dart';
import '../models/log.dart';

final firestoreServiceProvider = Provider<FirestoreService>((ref) {
  return FirestoreService();
});

class FirestoreService {
  final _firestore = FirebaseFirestore.instance;

  // Collections as per backend schema
  static const String alumniCollection = 'alumni';
  static const String coursesCollection = 'courses';
  static const String questionnairesCollection = 'questionnaires';
  static const String logsCollection = 'logs';
  static const String responseSubcollection = 'questionnaireResponses';

  // ============ ALUMNI OPERATIONS ============
  Future<void> createAlumnus(Alumnus alumnus) async {
    try {
      await _firestore
          .collection(alumniCollection)
          .doc(alumnus.id)
          .set(alumnus.toJson());
    } catch (e) {
      throw Exception('Failed to create alumnus: $e');
    }
  }

  Future<Alumnus?> getAlumnus(String alumnusId) async {
    try {
      final doc =
          await _firestore.collection(alumniCollection).doc(alumnusId).get();
      if (doc.exists) {
        return Alumnus.fromJson(doc.data() ?? {});
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get alumnus: $e');
    }
  }

  Future<void> updateAlumnus(Alumnus alumnus) async {
    try {
      await _firestore
          .collection(alumniCollection)
          .doc(alumnus.id)
          .update(alumnus.toJson());
    } catch (e) {
      throw Exception('Failed to update alumnus: $e');
    }
  }

  Future<void> deleteAlumnus(String alumnusId) async {
    try {
      await _firestore.collection(alumniCollection).doc(alumnusId).delete();
    } catch (e) {
      throw Exception('Failed to delete alumnus: $e');
    }
  }

  Stream<Alumnus?> getAlumnusStream(String alumnusId) {
    return _firestore
        .collection(alumniCollection)
        .doc(alumnusId)
        .snapshots()
        .map((snapshot) {
      if (snapshot.exists) {
        return Alumnus.fromJson(snapshot.data() ?? {});
      }
      return null;
    });
  }

  Stream<List<Alumnus>> getAllAlumniStream({bool? surveyCompleted}) {
    Query query = _firestore.collection(alumniCollection);
    if (surveyCompleted != null) {
      query = query.where('surveyCompleted', isEqualTo: surveyCompleted);
    }
    return (query as CollectionReference).snapshots().map((snapshot) => snapshot
        .docs
        .map((doc) => Alumnus.fromJson(doc.data() as Map<String, dynamic>))
        .toList());
  }

  // ============ COURSE OPERATIONS ============
  Future<void> createCourse(Course course) async {
    try {
      await _firestore
          .collection(coursesCollection)
          .doc(course.id)
          .set(course.toJson());
    } catch (e) {
      throw Exception('Failed to create course: $e');
    }
  }

  Future<Course?> getCourse(String courseId) async {
    try {
      final doc =
          await _firestore.collection(coursesCollection).doc(courseId).get();
      if (doc.exists) {
        return Course.fromJson(doc.data() ?? {});
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get course: $e');
    }
  }

  Stream<List<Course>> getCoursesStream() {
    return _firestore.collection(coursesCollection).snapshots().map(
        (snapshot) =>
            snapshot.docs.map((doc) => Course.fromJson(doc.data())).toList());
  }

  // ============ QUESTIONNAIRE OPERATIONS ============
  Future<List<Questionnaire>> getQuestionnaires() async {
    try {
      final snapshot = await _firestore
          .collection(questionnairesCollection)
          .where('isActive', isEqualTo: true)
          .get();
      return snapshot.docs
          .map((doc) => Questionnaire.fromJson(doc.data()))
          .toList();
    } catch (e) {
      throw Exception('Failed to get questionnaires: $e');
    }
  }

  Stream<List<Questionnaire>> getQuestionnairesStream() {
    return _firestore
        .collection(questionnairesCollection)
        .where('isActive', isEqualTo: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => Questionnaire.fromJson(doc.data()))
            .toList());
  }

  // ============ QUESTIONNAIRE RESPONSE OPERATIONS ============
  // Responses are stored at: /alumni/{alumnusId}/questionnaireResponses/{responseId}
  Future<void> submitQuestionnaireResponse(
    String alumnusId,
    QuestionnaireResponse response,
  ) async {
    try {
      await _firestore
          .collection(alumniCollection)
          .doc(alumnusId)
          .collection(responseSubcollection)
          .doc() // Auto-generated ID
          .set(response.toJson());
    } catch (e) {
      throw Exception('Failed to submit response: $e');
    }
  }

  Stream<List<QuestionnaireResponse>> getAlumnusResponsesStream(
      String alumnusId) {
    return _firestore
        .collection(alumniCollection)
        .doc(alumnusId)
        .collection(responseSubcollection)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => QuestionnaireResponse.fromJson(doc.data()))
            .toList());
  }

  // ============ LOG OPERATIONS ============
  Future<void> createLog(Log log) async {
    try {
      await _firestore
          .collection(logsCollection)
          .doc()
          .set(log.toJson()); // Auto-generated ID
    } catch (e) {
      throw Exception('Failed to create log: $e');
    }
  }

  Stream<List<Log>> getLogsStream({int limit = 100}) {
    return _firestore
        .collection(logsCollection)
        .orderBy('timestamp', descending: true)
        .limit(limit)
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => Log.fromJson(doc.data())).toList());
  }
}
