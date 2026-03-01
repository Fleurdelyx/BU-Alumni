import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../providers/statistics_provider.dart';
import '../../theme/app_theme.dart';

class StatisticsSection extends ConsumerWidget {
  const StatisticsSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statisticsAsync = ref.watch(statisticsProvider);

    return statisticsAsync.when(
      data: (statistics) {
        if (statistics.courseStatistics.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.bar_chart_outlined,
                  size: 64,
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppTheme.darkGrey
                      : const Color(0xFFCCCCCC),
                ),
                const SizedBox(height: 16),
                Text(
                  'No Statistics Yet',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Statistics will appear as more participants respond',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Overview Cards
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Overview',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildStatCard(
                            context,
                            'Total Alumni',
                            statistics.totalAlumni.toString(),
                          ),
                          _buildStatCard(
                            context,
                            'Respondents',
                            statistics.respondents.toString(),
                          ),
                          _buildStatCard(
                            context,
                            'Response Rate',
                            '${(statistics.responseRate * 100).toStringAsFixed(1)}%',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Courses Chart
              if (statistics.courseStatistics.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Alumni by Original Course',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: SizedBox(
                          height: 300,
                          child: _buildCourseChart(statistics.courseStatistics),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._buildCourseList(context, statistics.courseStatistics),
                    const SizedBox(height: 20),
                  ],
                ),

              // Relatedness Chart
              if (statistics.relatednessStatistics.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Course Relatedness to Current Job',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: SizedBox(
                          height: 250,
                          child: _buildRelatednessChart(
                            statistics.relatednessStatistics,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),

              // Job Fields Chart
              if (statistics.fieldStatistics.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Current Job Fields',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: SizedBox(
                          height: 300,
                          child: _buildJobFieldsChart(
                            statistics.fieldStatistics,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._buildJobFieldsList(context, statistics.fieldStatistics),
                  ],
                ),
            ],
          ),
        );
      },
      loading: () => const Center(
        child: CircularProgressIndicator(),
      ),
      error: (error, stack) {
        // Log error for debugging
        print('[Statistics] Error: $error');
        print('[Statistics] Stack trace: $stack');

        return Center(
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
                'Error loading statistics',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Details: ${error.toString()}',
                style: Theme.of(context).textTheme.bodySmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  // Trigger a refresh
                  final _ = ref.refresh(statisticsProvider);
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(BuildContext context, String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppTheme.secondaryGreen,
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildCourseChart(List<dynamic> courseStats) {
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: (courseStats
                    .map((c) => (c.count as int).toDouble())
                    .reduce((a, b) => a > b ? a : b) *
                1.2)
            .toDouble(),
        barGroups: courseStats
            .asMap()
            .entries
            .map(
              (entry) => BarChartGroupData(
                x: entry.key,
                barRods: [
                  BarChartRodData(
                    toY: (entry.value.count as int).toDouble(),
                    color: AppTheme.secondaryGreen,
                    width: 16,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(4),
                    ),
                  ),
                ],
              ),
            )
            .toList(),
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index < courseStats.length) {
                  return Text(
                    courseStats[index].courseName.substring(0, 3),
                    style: const TextStyle(fontSize: 10),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: true),
          ),
        ),
      ),
    );
  }

  Widget _buildRelatednessChart(List<dynamic> relatednessStats) {
    return PieChart(
      PieChartData(
        sections: relatednessStats
            .map(
              (stat) => PieChartSectionData(
                color: _getRelatednessColor(stat.category),
                value: stat.percentage.toDouble(),
                title: stat.category,
                radius: 40,
              ),
            )
            .toList(),
        centerSpaceRadius: 40,
      ),
    );
  }

  Widget _buildJobFieldsChart(List<dynamic> fieldStats) {
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: (fieldStats
                    .map((f) => (f.count as int).toDouble())
                    .reduce((a, b) => a > b ? a : b) *
                1.2)
            .toDouble(),
        barGroups: fieldStats
            .asMap()
            .entries
            .map(
              (entry) => BarChartGroupData(
                x: entry.key,
                barRods: [
                  BarChartRodData(
                    toY: (entry.value.count as int).toDouble(),
                    color: AppTheme.primaryGreen,
                    width: 16,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(4),
                    ),
                  ),
                ],
              ),
            )
            .toList(),
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index < fieldStats.length) {
                  final label = fieldStats[index].fieldName;
                  return Text(
                    label.length > 8 ? '${label.substring(0, 8)}...' : label,
                    style: const TextStyle(fontSize: 10),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: true),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildCourseList(BuildContext context, List<dynamic> courses) {
    return courses
        .map(
          (course) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    course.courseName,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
                Row(
                  children: [
                    Text(
                      '${course.count}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.secondaryGreen.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '${(course.percentage * 100).toStringAsFixed(1)}%',
                        style: const TextStyle(
                          color: AppTheme.secondaryGreen,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        )
        .toList();
  }

  List<Widget> _buildJobFieldsList(BuildContext context, List<dynamic> fields) {
    return fields
        .map(
          (field) => Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        field.fieldName,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryGreen.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${field.count} alumni',
                          style: const TextStyle(
                            color: AppTheme.primaryGreen,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    children: field.jobTitles
                        .take(3)
                        .map<Widget>(
                          (title) => Chip(
                            label: Text(
                              title,
                              style: const TextStyle(fontSize: 12),
                            ),
                            backgroundColor:
                                AppTheme.secondaryGreen.withOpacity(0.1),
                          ),
                        )
                        .toList(),
                  ),
                  if (field.jobTitles.length > 3)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        '+${field.jobTitles.length - 3} more jobs',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.secondaryGreen,
                            ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        )
        .toList();
  }

  Color _getRelatednessColor(String category) {
    switch (category.toLowerCase()) {
      case 'highly related':
      case 'related':
        return AppTheme.successGreen;
      case 'somewhat related':
        return AppTheme.secondaryGreen;
      case 'not related':
      default:
        return AppTheme.errorRed;
    }
  }
}
