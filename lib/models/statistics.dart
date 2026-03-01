class CourseStatistic {
  final String courseName;
  final int count;
  final double percentage;

  CourseStatistic({
    required this.courseName,
    required this.count,
    required this.percentage,
  });

  factory CourseStatistic.fromJson(Map<String, dynamic> json) {
    return CourseStatistic(
      courseName: json['courseName'] as String? ?? '',
      count: json['count'] as int? ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'courseName': courseName,
      'count': count,
      'percentage': percentage,
    };
  }
}

class RelatednessStatistic {
  final String category;
  final int count;
  final double percentage;

  RelatednessStatistic({
    required this.category,
    required this.count,
    required this.percentage,
  });

  factory RelatednessStatistic.fromJson(Map<String, dynamic> json) {
    return RelatednessStatistic(
      category: json['category'] as String? ?? '',
      count: json['count'] as int? ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'category': category,
      'count': count,
      'percentage': percentage,
    };
  }
}

class JobFieldStatistic {
  final String fieldName;
  final int count;
  final double percentage;
  final List<String> jobTitles;

  JobFieldStatistic({
    required this.fieldName,
    required this.count,
    required this.percentage,
    required this.jobTitles,
  });

  factory JobFieldStatistic.fromJson(Map<String, dynamic> json) {
    return JobFieldStatistic(
      fieldName: json['fieldName'] as String? ?? '',
      count: json['count'] as int? ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.0,
      jobTitles: List<String>.from(json['jobTitles'] as List<dynamic>? ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fieldName': fieldName,
      'count': count,
      'percentage': percentage,
      'jobTitles': jobTitles,
    };
  }
}

class Statistics {
  final int totalAlumni;
  final int respondents;
  final double responseRate;
  final List<CourseStatistic> courseStatistics;
  final List<RelatednessStatistic> relatednessStatistics;
  final List<JobFieldStatistic> fieldStatistics;
  final DateTime lastUpdated;

  Statistics({
    required this.totalAlumni,
    required this.respondents,
    required this.responseRate,
    required this.courseStatistics,
    required this.relatednessStatistics,
    required this.fieldStatistics,
    required this.lastUpdated,
  });

  factory Statistics.fromJson(Map<String, dynamic> json) {
    return Statistics(
      totalAlumni: json['totalAlumni'] as int? ?? 0,
      respondents: json['respondents'] as int? ?? 0,
      responseRate: (json['responseRate'] as num?)?.toDouble() ?? 0.0,
      courseStatistics: (json['courseStatistics'] as List<dynamic>? ?? [])
          .map((c) => CourseStatistic.fromJson(c as Map<String, dynamic>))
          .toList(),
      relatednessStatistics:
          (json['relatednessStatistics'] as List<dynamic>? ?? [])
              .map((r) => RelatednessStatistic.fromJson(r as Map<String, dynamic>))
              .toList(),
      fieldStatistics: (json['fieldStatistics'] as List<dynamic>? ?? [])
          .map((f) => JobFieldStatistic.fromJson(f as Map<String, dynamic>))
          .toList(),
      lastUpdated: json['lastUpdated'] != null
          ? DateTime.parse(json['lastUpdated'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalAlumni': totalAlumni,
      'respondents': respondents,
      'responseRate': responseRate,
      'courseStatistics':
          courseStatistics.map((c) => c.toJson()).toList(),
      'relatednessStatistics':
          relatednessStatistics.map((r) => r.toJson()).toList(),
      'fieldStatistics': fieldStatistics.map((f) => f.toJson()).toList(),
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }
}
