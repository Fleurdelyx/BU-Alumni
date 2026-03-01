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

  // Firestore paths as per backend schema
  // alumni_profiles: /alumni/{uid}
  // alumni_responses: /alumni/{uid}/questionnaireResponses/{responseId}
  // studies: /questionnaires/{id}
  // activity_logs: /logs/{id}
  // courses: /courses/{id}
  static const String alumniCollection = 'alumni';
  static const String coursesCollection = 'courses';
  static const String questionnairesCollection = 'questionnaires';
  static const String logsCollection = 'logs';
  static const String responseSubcollection = 'questionnaireResponses';

  // ============ ALUMNI OPERATIONS ============
  // Creates alumnus profile at /alumni/{uid}
  Future<void> createAlumnus(Alumnus alumnus) async {
    try {
      await _firestore
          .collection(alumniCollection)
          .doc(alumnus.userId) // Use userId as document ID
          .set(alumnus.toJson());
      print('[Firestore] Created alumnus: ${alumnus.userId}');
    } catch (e) {
      throw Exception('Failed to create alumnus: $e');
    }
  }

  Future<Alumnus?> getAlumnus(String userId) async {
    try {
      final doc =
          await _firestore.collection(alumniCollection).doc(userId).get();
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
          .doc(alumnus.userId) // Use userId as document ID
          .update(alumnus.toJson());
    } catch (e) {
      throw Exception('Failed to update alumnus: $e');
    }
  }

  Future<void> deleteAlumnus(String userId) async {
    try {
      await _firestore.collection(alumniCollection).doc(userId).delete();
    } catch (e) {
      throw Exception('Failed to delete alumnus: $e');
    }
  }

  Stream<Alumnus?> getAlumnusStream(String userId) {
    return _firestore
        .collection(alumniCollection)
        .doc(userId)
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

    return (query as CollectionReference).snapshots().map((snapshot) {
      print(
          '[Firestore] getAllAlumniStream: Got ${snapshot.docs.length} alumni documents');

      try {
        final alumni = snapshot.docs
            .map((doc) {
              try {
                return Alumnus.fromJson(doc.data() as Map<String, dynamic>);
              } catch (e) {
                print(
                    '[Firestore] Error parsing alumnus document ${doc.id}: $e');
                return null;
              }
            })
            .where((alumnus) => alumnus != null)
            .cast<Alumnus>()
            .toList();

        print(
            '[Firestore] getAllAlumniStream: Successfully parsed ${alumni.length} alumni');
        return alumni;
      } catch (e) {
        print('[Firestore] getAllAlumniStream: Error processing documents: $e');
        throw Exception('Failed to process alumni data: $e');
      }
    }).handleError((error) {
      print('[Firestore] getAllAlumniStream ERROR: $error');
      throw Exception('Failed to load alumni: $error');
    });
  }

  // Helper method to find Alumnus by userId (Firebase Auth UID)
  Future<Alumnus?> getAlumnusByUserId(String userId) async {
    try {
      final snapshot = await _firestore
          .collection(alumniCollection)
          .where('userId', isEqualTo: userId)
          .limit(1)
          .get();
      if (snapshot.docs.isNotEmpty) {
        return Alumnus.fromJson(snapshot.docs.first.data());
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get alumnus by userId: $e');
    }
  }

  // Stream version to find Alumnus by userId
  Stream<Alumnus?> getAlumnusByUserIdStream(String userId) {
    return _firestore
        .collection(alumniCollection)
        .where('userId', isEqualTo: userId)
        .limit(1)
        .snapshots()
        .map((snapshot) {
      if (snapshot.docs.isNotEmpty) {
        return Alumnus.fromJson(snapshot.docs.first.data());
      }
      return null;
    });
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
    return _firestore.collection(coursesCollection).snapshots().map((snapshot) {
      print(
          '[Firestore] getCoursesStream: Got ${snapshot.docs.length} courses');
      return snapshot.docs.map((doc) => Course.fromJson(doc.data())).toList();
    }).handleError((error) {
      print('[Firestore] getCoursesStream ERROR: $error');
      throw error;
    });
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
        .map((snapshot) {
      print(
          '[Firestore] getQuestionnairesStream: Got ${snapshot.docs.length} questionnaires');
      return snapshot.docs
          .map((doc) => Questionnaire.fromJson(doc.data()))
          .toList();
    }).handleError((error) {
      print('[Firestore] getQuestionnairesStream ERROR: $error');
      throw error;
    });
  }

  // ============ QUESTIONNAIRE RESPONSE OPERATIONS ============
  // Responses are stored at: /alumni/{uid}/questionnaireResponses/{responseId}
  Future<void> submitQuestionnaireResponse(
    QuestionnaireResponse response,
  ) async {
    try {
      // Generate auto-ID for the response document
      final docRef = _firestore
          .collection(alumniCollection)
          .doc(response.alumnusId)
          .collection(responseSubcollection)
          .doc(); // Auto-generated ID

      await docRef.set(response.toJson());
      print(
          '[Firestore] Submitted response for alumnus: ${response.alumnusId}');
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
  // Audit trail stored at: /logs/{id}
  Future<void> createLog(Log log) async {
    try {
      // Generate auto-ID for the log document
      final docRef = _firestore.collection(logsCollection).doc();
      await docRef.set(log.toJson());
      print('[Firestore] Created log for user: ${log.userId}');
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
