import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Simple auth screen with login/signup toggle.
// No invite codes — after signup, the user is auto-linked to the shared relationship.
export default function AuthScreen() {
  const { signUp, login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Name is required.');
        if (!email.trim()) throw new Error('Email is required.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await signUp(email, password, name.trim());
      } else {
        if (!email.trim()) throw new Error('Email is required.');
        if (!password) throw new Error('Password is required.');
        await login(email, password);
      }
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already in use.'
        : err.code === 'auth/wrong-password' ? 'Wrong password.'
        : err.code === 'auth/user-not-found' ? 'No account with this email.'
        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.'
        : err.code === 'auth/invalid-email' ? 'Please enter a valid email address.'
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={styles.heroCircle}>
            <Icon name="camera-burst" size={48} color="#FF6B6B" />
          </View>
          <View style={styles.floatingHeart}>
            <Icon name="heart" size={16} color="#FF8FA3" />
          </View>
          <View style={styles.floatingStar}>
            <Icon name="star-four-points" size={14} color="#FFB347" />
          </View>
        </View>

        <Text style={styles.title}>
          Moment Capture 📸❤️
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </Text>

        {/* Name field — only shown during signup */}
        {isSignUp && (
          <TextInput
            label="Your Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
            mode="outlined"
            outlineColor="#FFE0E6"
            activeOutlineColor="#FF6B6B"
            outlineStyle={{ borderRadius: 16 }}
          />
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          outlineColor="#FFE0E6"
          activeOutlineColor="#FF6B6B"
          outlineStyle={{ borderRadius: 16 }}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          mode="outlined"
          outlineColor="#FFE0E6"
          activeOutlineColor="#FF6B6B"
          outlineStyle={{ borderRadius: 16 }}
        />

        {/* Inline error message — visible above the button */}
        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Gradient submit button */}
        <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8} style={{ marginTop: 8 }}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <Text style={styles.gradientButtonText}>...</Text>
            ) : (
              <>
                <Icon name={isSignUp ? 'account-plus' : 'login'} size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.gradientButtonText}>
                  {isSignUp ? 'Sign Up' : 'Log In'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setIsSignUp(!isSignUp); setError(''); }}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Made with ❤️ for couples</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFE0E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeart: {
    position: 'absolute',
    top: 0,
    right: '30%',
  },
  floatingStar: {
    position: 'absolute',
    bottom: 4,
    left: '28%',
  },
  title: {
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 4,
    color: '#FF6B6B',
    fontSize: 32,
  },
  subtitle: {
    textAlign: 'center',
    color: '#8E8E8E',
    marginBottom: 40,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  gradientButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  footerText: {
    textAlign: 'center',
    color: '#C4A8A8',
    marginTop: 32,
    fontSize: 13,
  },
});
