import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_generative_ai/google_generative_ai.dart';

final chatbotServiceProvider = Provider<ChatbotService>((ref) {
  return ChatbotService();
});

class ChatbotService {
  late GenerativeModel _model;
  late ChatSession _chatSession;

  ChatbotService() {
    // Initialize with your Google API Key
    // Get it from https://aistudio.google.com/app/apikey
    const apiKey = 'AIzaSyB8NmL2bXxa4mynaFgoNj0A-0qELtSwxE4';

    _model = GenerativeModel(
      model: 'gemini-pro',
      apiKey: apiKey,
    );
    _chatSession = _model.startChat();
  }

  Future<String> getBUddyResponse(String userMessage) async {
    try {
      // System prompt for BUddy
      const _ =
          '''You are BUddy, an AI assistant for the Baliuag University Alumni Tracer application. Your role is to help users navigate the app and answer questions about the features.

Known features:
1. Questionnaires - Help alumni fill out surveys about their career development
2. Participants - Browse information about other alumni who have participated
3. Statistics - View charts and graphs about alumni career outcomes
4. Settings - Manage profile, avatar, dark mode, and delete account
5. Original Courses - See statistics about alumni from different programs
6. Job Fields - View what fields alumni are working in
7. Course Relatedness - Check how related alumni jobs are to their original courses

Always be friendly, helpful, and concise. If asked about something unrelated to the app, politely redirect the conversation back to the Alumni Tracer features.''';

      // Send message
      final response = await _chatSession.sendMessage(
        Content.text(userMessage),
      );

      if (response.text != null) {
        return response.text!;
      }
      return 'Sorry, I couldn\'t process that. Please try again.';
    } catch (e) {
      return 'BUddy is taking a break. Please try again later!';
    }
  }

  void resetChat() {
    const apiKey = 'YOUR_GOOGLE_AI_API_KEY';
    _model = GenerativeModel(
      model: 'gemini-pro',
      apiKey: apiKey,
    );
    _chatSession = _model.startChat();
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}
