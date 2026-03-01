import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/questionnaire_provider.dart';
import 'questionnaire_detail_screen.dart';
import '../../theme/app_theme.dart';

class QuestionnairesSection extends ConsumerWidget {
  const QuestionnairesSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final questionnairesAsync = ref.watch(questionnairesProvider);

    return questionnairesAsync.when(
      data: (questionnaires) {
        if (questionnaires.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.assignment_outlined,
                  size: 64,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppTheme.darkGrey
                      : const Color(0xFFCCCCCC),
                ),
                const SizedBox(height: 16),
                Text(
                  'No Questionnaires Available',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Check back later for new surveys',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: questionnaires.length,
          itemBuilder: (context, index) {
            final questionnaire = questionnaires[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: const Icon(
                  Icons.assignment,
                  color: AppTheme.primaryGreen,
                ),
                title: Text(
                  questionnaire.title,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      questionnaire.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${questionnaire.questions.length} questions',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.secondaryGreen,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => QuestionnaireDetailScreen(
                        questionnaire: questionnaire,
                      ),
                    ),
                  );
                },
              ),
            );
          },
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(),
      ),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 48,
              color: AppTheme.errorRed,
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading questionnaires',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
