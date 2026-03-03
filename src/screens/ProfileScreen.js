import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useRelationship } from '../contexts/RelationshipContext';

// Simple profile screen showing user info, streak stats, and logout button.
export default function ProfileScreen() {
  const { userData, logout } = useAuth();
  const { relationship } = useRelationship();

  const initial = (userData?.name || 'U').charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.name}>
          {userData?.name || 'User'}
        </Text>
        <Text style={styles.email}>
          {userData?.email}
        </Text>
      </View>

      {/* Stats cards */}
      {relationship && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon name="fire" size={28} color="#FF6B6B" />
            <Text style={styles.statValue}>{relationship.currentStreak}</Text>
            <Text style={styles.statLabel}>Week Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={28} color="#FF6B6B" />
            <Text style={styles.statValue}>
              {relationship.stats?.totalWeeksCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      )}

      {/* Logout — gradient button */}
      <TouchableOpacity onPress={logout} activeOpacity={0.8} style={styles.logoutWrapper}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Icon name="logout" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.gradientButtonText}>Log Out</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  contentContainer: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE0E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  email: {
    color: '#8E8E8E',
    marginTop: 4,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#FF8FA3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 8,
  },
  statLabel: {
    color: '#8E8E8E',
    fontSize: 13,
    marginTop: 4,
  },
  logoutWrapper: {
    marginTop: 8,
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
});
