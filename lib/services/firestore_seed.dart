import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/alumnus.dart';

/// Helper class to seed Firestore with test data for development
class FirestoreSeed {
  static final _firestore = FirebaseFirestore.instance;

  /// Seeds the database with sample data
  /// Call this once during app initialization or manually
  static Future<void> seedDatabase() async {
    try {
      print('[SEED] Starting database seeding...');

      // Check if data already exists
      final questionnairesSnapshot =
          await _firestore.collection('questionnaires').limit(1).get();
      if (questionnairesSnapshot.docs.isNotEmpty) {
        print('[SEED] Database already seeded, skipping...');
        return;
      }

      // Seed questionnaires
      await _seedQuestionnaires();

      // Seed courses
      await _seedCourses();

      // Seed sample alumni for testing
      await _seedSampleAlumni();

      print('[SEED] Database seeding completed successfully!');
    } catch (e) {
      print('[SEED] Error seeding database: $e');
      rethrow;
    }
  }

  static Future<void> _seedQuestionnaires() async {
    final questionnaires = [
      {
        'title': 'Career Survey 2024',
        'description':
            'Tell us about your current career path and job satisfaction',
        'questions': [
          'What is your current employment status?',
          'Is your current job related to your degree?',
          'How satisfied are you with your current role? (1-10)',
          'What advice would you give to current students?',
        ],
        'isActive': true,
        'status': 'published',
        'datePublished': '2024-01-15',
        'responseCount': 15,
      },
      {
        'title': 'Alumni Connect Survey',
        'description': 'Help us understand your journey after graduation',
        'questions': [
          'How many years have you been working since graduation?',
          'Which industry are you working in?',
          'What is your current job title?',
          'Would you recommend your course to current students?',
        ],
        'isActive': true,
        'status': 'published',
        'datePublished': '2024-02-01',
        'responseCount': 8,
      },
    ];

    for (int i = 0; i < questionnaires.length; i++) {
      final q = questionnaires[i];
      final docId = 'q${i + 1}'; // q1, q2, etc.
      await _firestore.collection('questionnaires').doc(docId).set(q);
      print('[SEED] Created questionnaire: $docId - ${q['title']}');
    }
  }

  static Future<void> _seedCourses() async {
    final courses = [
      {
        'id': 'cs101',
        'name': 'Computer Science',
        'description': 'Bachelor of Science in Computer Science',
      },
      {
        'id': 'bs102',
        'name': 'Business Studies',
        'description': 'Bachelor of Science in Business Administration',
      },
      {
        'id': 'eng103',
        'name': 'Engineering',
        'description': 'Bachelor of Engineering',
      },
      {
        'id': 'acc104',
        'name': 'Accounting',
        'description': 'Bachelor of Commerce - Accounting',
      },
      {
        'id': 'fin105',
        'name': 'Finance',
        'description': 'Bachelor of Science in Finance',
      },
    ];

    for (final course in courses) {
      final id = course['id'] as String;
      await _firestore.collection('courses').doc(id).set(course);
      print('[SEED] Created course: ${course['id']} - ${course['name']}');
    }
  }

  /// Seed sample alumni for testing purposes
  static Future<void> _seedSampleAlumni() async {
    final sampleAlumni = [
      Alumnus(
        userId: 'user123',
        name: 'John Dela Cruz',
        email: 'john.delacruz@email.com',
        course: 'Computer Science',
        graduationYear: 2020,
        employmentStatus: 'employed',
        jobTitle: 'Software Engineer',
        company: 'Tech Solutions Inc.',
        isCourseRelated: 'yes',
        submissionDate: '2024-01-15T10:30:00Z',
        surveyCompleted: true,
      ),
      Alumnus(
        userId: 'user456',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        course: 'Business Studies',
        graduationYear: 2019,
        employmentStatus: 'employed',
        jobTitle: 'Business Analyst',
        company: 'Corporate Solutions Ltd.',
        isCourseRelated: 'yes',
        submissionDate: '2024-01-20T14:15:00Z',
        surveyCompleted: true,
      ),
      Alumnus(
        userId: 'user789',
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@email.com',
        course: 'Engineering',
        graduationYear: 2021,
        employmentStatus: 'employed',
        jobTitle: 'Project Manager',
        company: 'Infrastructure Corp.',
        isCourseRelated: 'somewhat',
        submissionDate: '2024-02-01T09:45:00Z',
        surveyCompleted: false,
      ),
      Alumnus(
        userId: 'user101',
        name: 'Anna Reyes',
        email: 'anna.reyes@email.com',
        course: 'Accounting',
        graduationYear: 2018,
        employmentStatus: 'self-employed',
        jobTitle: 'Freelance Accountant',
        company: 'AR Accounting Services',
        isCourseRelated: 'yes',
        submissionDate: '2024-02-05T16:20:00Z',
        surveyCompleted: true,
      ),
      Alumnus(
        userId: 'user202',
        name: 'Michael Garcia',
        email: 'michael.garcia@email.com',
        course: 'Finance',
        graduationYear: 2022,
        employmentStatus: 'unemployed',
        isCourseRelated: 'no',
        submissionDate: '2024-02-10T11:30:00Z',
        surveyCompleted: false,
      ),
    ];

    for (final alumnus in sampleAlumni) {
      await _firestore
          .collection('alumni')
          .doc(alumnus.userId) // Use userId as document ID
          .set(alumnus.toJson());
      print('[SEED] Created sample alumnus: ${alumnus.name}');
    }
  }

  /// Create a sample alumnus for the current user
  static Future<void> createSampleAlumnus(String userId) async {
    try {
      final alumnus = Alumnus(
        userId: userId,
        name: 'Sample Alumni',
        email: 'alumni@example.com',
        course: 'Computer Science',
        graduationYear: 2020,
        employmentStatus: 'employed',
        jobTitle: 'Software Engineer',
        company: 'Tech Company Inc.',
        isCourseRelated: 'yes',
        submissionDate: DateTime.now().toIso8601String(),
        surveyCompleted: false,
      );

      await _firestore.collection('alumni').doc(userId).set(alumnus.toJson());
      print('[SEED] Created sample alumnus for user: $userId');
    } catch (e) {
      print('[SEED] Error creating sample alumnus: $e');
    }
  }
}
