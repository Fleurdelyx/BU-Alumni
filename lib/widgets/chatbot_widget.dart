import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/chatbot_service.dart';
import '../../theme/app_theme.dart';

class ChatbotWidget extends ConsumerStatefulWidget {
  const ChatbotWidget({super.key});

  @override
  ConsumerState<ChatbotWidget> createState() => _ChatbotWidgetState();
}

class _ChatbotWidgetState extends ConsumerState<ChatbotWidget> {
  final _messages = <ChatMessage>[];
  final _controller = TextEditingController();
  bool _isLoading = false;
  late ChatbotService _chatbotService;

  @override
  void initState() {
    super.initState();
    _chatbotService = ChatbotService();
    _addMessage(
      ChatMessage(
        text:
            'Hi! I\'m BUddy, your AI assistant for the BU Alumni Tracer app. How can I help you today?',
        isUser: false,
        timestamp: DateTime.now(),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _addMessage(ChatMessage message) {
    setState(() {
      _messages.add(message);
    });
  }

  Future<void> _sendMessage() async {
    if (_controller.text.isEmpty) return;

    final userMessage = _controller.text;
    _controller.clear();

    _addMessage(
      ChatMessage(
        text: userMessage,
        isUser: true,
        timestamp: DateTime.now(),
      ),
    );

    setState(() => _isLoading = true);

    try {
      final response = await _chatbotService.getBUddyResponse(userMessage);
      _addMessage(
        ChatMessage(
          text: response,
          isUser: false,
          timestamp: DateTime.now(),
        ),
      );
    } catch (e) {
      _addMessage(
        ChatMessage(
          text: 'Sorry, I encountered an error. Please try again later.',
          isUser: false,
          timestamp: DateTime.now(),
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppTheme.primaryGreen, AppTheme.secondaryGreen],
            ),
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(20),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppTheme.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.smart_toy,
                  color: AppTheme.primaryGreen,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BUddy',
                      style: TextStyle(
                        color: AppTheme.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'AI Assistant',
                      style: TextStyle(
                        color: AppTheme.white,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: const Icon(
                  Icons.close,
                  color: AppTheme.white,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Container(
            color: isDarkMode ? AppTheme.darkBg : AppTheme.lightGrey,
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessageBubble(context, message);
              },
            ),
          ),
        ),
        if (_isLoading)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'BUddy is thinking',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(width: 8),
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      AppTheme.secondaryGreen,
                    ),
                  ),
                ),
              ],
            ),
          ),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDarkMode ? AppTheme.darkSurface : AppTheme.white,
            border: Border(
              top: BorderSide(
                color: isDarkMode ? AppTheme.darkGrey : Colors.grey[300]!,
              ),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: InputDecoration(
                    hintText: 'Ask BUddy something...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  maxLines: 1,
                ),
              ),
              const SizedBox(width: 8),
              FloatingActionButton(
                mini: true,
                backgroundColor: AppTheme.secondaryGreen,
                onPressed: _isLoading ? null : _sendMessage,
                child: const Icon(
                  Icons.send,
                  color: AppTheme.white,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMessageBubble(BuildContext context, ChatMessage message) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!message.isUser)
            Container(
              width: 28,
              height: 28,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: AppTheme.secondaryGreen,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(
                Icons.smart_toy,
                color: AppTheme.white,
                size: 16,
              ),
            ),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: message.isUser
                    ? AppTheme.secondaryGreen
                    : (isDarkMode ? AppTheme.darkSurface : AppTheme.white),
                borderRadius: BorderRadius.circular(12),
                border: !message.isUser
                    ? Border.all(
                        color:
                            isDarkMode ? AppTheme.darkGrey : Colors.grey[300]!,
                      )
                    : null,
              ),
              child: Text(
                message.text,
                style: TextStyle(
                  color: message.isUser ? AppTheme.white : null,
                ),
              ),
            ),
          ),
          if (message.isUser)
            Container(
              width: 28,
              height: 28,
              margin: const EdgeInsets.only(left: 8),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(
                Icons.person,
                color: AppTheme.white,
                size: 16,
              ),
            ),
        ],
      ),
    );
  }
}
