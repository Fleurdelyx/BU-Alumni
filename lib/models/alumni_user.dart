class AlumniUser {
  final String id;
  final String email;
  final String fullName;
  final String? avatarUrl;
  final String? originalCourse;
  final String? currentJobTitle;
  final String? currentField;
  final double? courseRelatedness;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isActive;

  AlumniUser({
    required this.id,
    required this.email,
    required this.fullName,
    this.avatarUrl,
    this.originalCourse,
    this.currentJobTitle,
    this.currentField,
    this.courseRelatedness,
    required this.createdAt,
    this.updatedAt,
    required this.isActive,
  });

  factory AlumniUser.fromJson(Map<String, dynamic> json) {
    return AlumniUser(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String?,
      originalCourse: json['originalCourse'] as String?,
      currentJobTitle: json['currentJobTitle'] as String?,
      currentField: json['currentField'] as String?,
      courseRelatedness: (json['courseRelatedness'] as num?)?.toDouble(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'avatarUrl': avatarUrl,
      'originalCourse': originalCourse,
      'currentJobTitle': currentJobTitle,
      'currentField': currentField,
      'courseRelatedness': courseRelatedness,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'isActive': isActive,
    };
  }

  AlumniUser copyWith({
    String? fullName,
    String? avatarUrl,
    String? originalCourse,
    String? currentJobTitle,
    String? currentField,
    double? courseRelatedness,
    bool? isActive,
  }) {
    return AlumniUser(
      id: id,
      email: email,
      fullName: fullName ?? this.fullName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      originalCourse: originalCourse ?? this.originalCourse,
      currentJobTitle: currentJobTitle ?? this.currentJobTitle,
      currentField: currentField ?? this.currentField,
      courseRelatedness: courseRelatedness ?? this.courseRelatedness,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      isActive: isActive ?? this.isActive,
    );
  }
}
