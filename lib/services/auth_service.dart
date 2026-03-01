import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthService {
  final _auth = FirebaseAuth.instance;

  User? get user => _auth.currentUser;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<bool> signUp({
    required String email,
    required String password,
    required String fullName,
  }) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (userCredential.user != null) {
        await userCredential.user!.updateDisplayName(fullName);
        return true;
      }
      return false;
    } on FirebaseAuthException catch (e) {
      throw Exception('Sign up failed: ${e.message}');
    }
  }

  Future<bool> signIn({
    required String email,
    required String password,
  }) async {
    try {
      print('[AUTH] Attempting sign in with email: $email');
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      print('[AUTH] Sign in successful: ${userCredential.user?.email}');
      return true;
    } on FirebaseAuthException catch (e) {
      print(
          '[AUTH] Sign in failed with code: ${e.code}, message: ${e.message}');
      throw Exception('Sign in failed: ${e.message}');
    } catch (e) {
      print('[AUTH] Unexpected error: $e');
      throw Exception('Sign in failed: $e');
    }
  }

  Future<bool> resetPassword({required String email}) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
      return true;
    } on FirebaseAuthException catch (e) {
      throw Exception('Password reset failed: ${e.message}');
    }
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user != null && user.email != null) {
        // Re-authenticate user
        final credential = EmailAuthProvider.credential(
          email: user.email!,
          password: currentPassword,
        );
        await user.reauthenticateWithCredential(credential);

        // Update password
        await user.updatePassword(newPassword);
        return true;
      }
      return false;
    } on FirebaseAuthException catch (e) {
      throw Exception('Password change failed: ${e.message}');
    }
  }

  Future<bool> deleteAccount({required String password}) async {
    try {
      final user = _auth.currentUser;
      if (user != null && user.email != null) {
        // Re-authenticate user
        final credential = EmailAuthProvider.credential(
          email: user.email!,
          password: password,
        );
        await user.reauthenticateWithCredential(credential);

        // Delete user
        await user.delete();
        return true;
      }
      return false;
    } on FirebaseAuthException catch (e) {
      throw Exception('Account deletion failed: ${e.message}');
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  String? getCurrentUserId() {
    final uid = _auth.currentUser?.uid;
    print('[AUTH] getCurrentUserId: $uid (user: ${_auth.currentUser?.email})');
    return uid;
  }

  String? getCurrentUserEmail() {
    return _auth.currentUser?.email;
  }
}
