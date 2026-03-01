class Alumnus {
  final String userId; // UID from Auth
  final String name; // Display Name
  final String email;
  final String course;
  final int graduationYear;
  final String
      employmentStatus; // 'employed', 'unemployed', 'self-employed', 'further-study'
  final String? jobTitle; // Optional
  final String? company; // Optional
  final String isCourseRelated; // 'yes', 'no', 'somewhat'
  final String? avatarUrl; // Data URI or URL
  final String submissionDate; // ISO 8601 String
  final bool surveyCompleted; // Crucial for UI state

  Alumnus({
    required this.userId,
    required this.name,
    required this.email,
    required this.course,
    required this.graduationYear,
    required this.employmentStatus,
    this.jobTitle,
    this.company,
    required this.isCourseRelated,
    this.avatarUrl,
    required this.submissionDate,
    required this.surveyCompleted,
  });

  // Convenience getter for compatibility
  String get id => userId;

  factory Alumnus.fromJson(Map<String, dynamic> json) {
    return Alumnus(
      userId: json['userId'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      course: json['course'] as String,
      graduationYear: json['graduationYear'] as int,
      employmentStatus: json['employmentStatus'] as String,
      jobTitle: json['jobTitle'] as String?,
      company: json['company'] as String?,
      isCourseRelated: json['isCourseRelated'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      submissionDate: json['submissionDate'] as String,
      surveyCompleted: json['surveyCompleted'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      'email': email,
      'course': course,
      'graduationYear': graduationYear,
      'employmentStatus': employmentStatus,
      'jobTitle': jobTitle,
      'company': company,
      'isCourseRelated': isCourseRelated,
      'avatarUrl': avatarUrl,
      'submissionDate': submissionDate,
      'surveyCompleted': surveyCompleted,
    };
  }
}
