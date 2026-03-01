import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alumnus.dart';
import '../services/firestore_service.dart';
import '../services/auth_service.dart';

final userProvider = StreamProvider.family<Alumnus?, String>((ref, alumnusId) {
  final firestoreService = ref.watch(firestoreServiceProvider);
  return firestoreService.getAlumnusStream(alumnusId);
});

final currentUserProvider = StreamProvider<Alumnus?>((ref) {
  final authService = ref.watch(authServiceProvider);
  final firestoreService = ref.watch(firestoreServiceProvider);

  final userId = authService.getCurrentUserId();
  if (userId == null) return Stream.value(null);

  return firestoreService.getAlumnusByUserIdStream(userId);
});

final authStateProvider = StreamProvider<bool>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges.map((user) => user != null);
});
