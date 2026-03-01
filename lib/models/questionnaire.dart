//  Administrative definitions of tracer studies and responses
//  Based on backend schema for Questionnaire and QuestionnaireResponse entities

class Questionnaire {
  final String title;
  final String description;
  final List<String> questions; // Array<String>
  final bool isActive;
  final String status; // 'published', 'draft'
  final String datePublished; // YYYY-MM-DD format
  final int responseCount;

  Questionnaire({
    required this.title,
    required this.description,
    required this.questions,
    required this.isActive,
    required this.status,
    required this.datePublished,
    required this.responseCount,
  });

  factory Questionnaire.fromJson(Map<String, dynamic> json) {
    return Questionnaire(
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      questions: List<String>.from(json['questions'] as List<dynamic>? ?? []),
      isActive: json['isActive'] as bool? ?? true,
      status: json['status'] as String? ?? 'draft',
      datePublished: json['datePublished'] as String? ?? '',
      responseCount: json['responseCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'questions': questions,
      'isActive': isActive,
      'status': status,
      'datePublished': datePublished,
      'responseCount': responseCount,
    };
  }
}

class QuestionnaireResponse {
  final String alumnusId; // String (UID)
  final String questionnaireId; // String (Ref to Questionnaire)
  final List<String> responses; // Array<String> (Ordered answers)
  final String submissionDate; // ISO 8601 String

  QuestionnaireResponse({
    required this.alumnusId,
    required this.questionnaireId,
    required this.responses,
    required this.submissionDate,
  });

  factory QuestionnaireResponse.fromJson(Map<String, dynamic> json) {
    return QuestionnaireResponse(
      alumnusId: json['alumnusId'] as String,
      questionnaireId: json['questionnaireId'] as String,
      responses: List<String>.from(json['responses'] as List<dynamic>? ?? []),
      submissionDate: json['submissionDate'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'alumnusId': alumnusId,
      'questionnaireId': questionnaireId,
      'responses': responses,
      'submissionDate': submissionDate,
    };
  }
}
