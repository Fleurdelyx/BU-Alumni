class Log {
  final String userId;
  final String userName;
  final String action;
  final String details;
  final String timestamp; // ISO 8601 String

  Log({
    required this.userId,
    required this.userName,
    required this.action,
    required this.details,
    required this.timestamp,
  });

  factory Log.fromJson(Map<String, dynamic> json) {
    return Log(
      userId: json['userId'] as String,
      userName: json['userName'] as String,
      action: json['action'] as String,
      details: json['details'] as String,
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'userName': userName,
      'action': action,
      'details': details,
      'timestamp': timestamp,
    };
  }
}
