import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/questionnaire.dart';
import '../../services/firestore_service.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';

class QuestionnaireDetailScreen extends ConsumerStatefulWidget {
  final Questionnaire questionnaire;

  const QuestionnaireDetailScreen({
    super.key,
    required this.questionnaire,
  });

  @override
  ConsumerState<QuestionnaireDetailScreen> createState() =>
      _QuestionnaireDetailScreenState();
}

class _QuestionnaireDetailScreenState
    extends ConsumerState<QuestionnaireDetailScreen> {
  late Map<String, String> _answers;
  bool _isSubmitting = false;
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    _answers = {};
    for (int i = 0; i < widget.questionnaire.questions.length; i++) {
      final questionKey = 'question_$i';
      _answers[questionKey] = '';
      _controllers[questionKey] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _submitQuestionnaire() async {
    // Check if all questions are answered
    bool hasEmptyAnswers = false;
    for (var answer in _answers.values) {
      if (answer.trim().isEmpty) {
        hasEmptyAnswers = true;
        break;
      }
    }

    if (hasEmptyAnswers) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please answer all questions'),
          backgroundColor: AppTheme.errorRed,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final authService = ref.read(authServiceProvider);
      final firestoreService = ref.read(firestoreServiceProvider);
      final userId = authService.getCurrentUserId();

      if (userId != null) {
        // Convert answers map to ordered list of responses
        List<String> responses = [];
        for (int i = 0; i < widget.questionnaire.questions.length; i++) {
          final questionKey = 'question_$i';
          responses.add(_answers[questionKey] ?? '');
        }

        final response = QuestionnaireResponse(
          alumnusId: userId,
          questionnaireId:
              widget.questionnaire.title, // Using title as ID for now
          responses: responses,
          submissionDate: DateTime.now().toIso8601String(),
        );

        // Submit response with the QuestionnaireResponse object
        await firestoreService.submitQuestionnaireResponse(response);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Questionnaire submitted successfully!'),
              backgroundColor: AppTheme.successGreen,
            ),
          );
          Navigator.pop(context);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error submitting: ${e.toString()}'),
            backgroundColor: AppTheme.errorRed,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.questionnaire.title),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              widget.questionnaire.description,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            ...widget.questionnaire.questions.asMap().entries.map((entry) {
              final index = entry.key;
              final question = entry.value;
              return _buildQuestionWidget(context, index, question);
            }),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitQuestionnaire,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppTheme.white,
                        ),
                      ),
                    )
                  : const Text('Submit Questionnaire'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionWidget(
      BuildContext context, int index, String question) {
    final questionKey = 'question_$index';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${index + 1}. $question',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _controllers[questionKey],
                  decoration: const InputDecoration(
                    hintText: 'Enter your answer',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
                  onChanged: (value) {
                    _answers[questionKey] = value;
                  },
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}
