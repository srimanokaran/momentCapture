import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useRelationship } from '../contexts/RelationshipContext';
import { getHoursRemaining } from '../utils/dateHelpers';
import PromptCard from '../components/PromptCard';

// Main screen showing today's prompt, submission status,
// and action buttons (submit, reveal, next day).
export default function HomeScreen({ navigation }) {
  const { user, userData } = useAuth();
  const { currentDay, currentPrompt, relationship, loading, advanceToNextDay } = useRelationship();
  const [error, setError] = React.useState('');
  const [starting, setStarting] = React.useState(false);

  const handleStartDay = async () => {
    setStarting(true);
    setError('');
    try {
      await advanceToNextDay();
    } catch (err) {
      console.log('Start day error:', err.message);
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // No prompt for today — show button to start one
  if (!currentDay) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIconCircle}>
          <Icon name="calendar-heart" size={64} color="#FF6B6B" />
        </View>
        <Text variant="headlineSmall" style={styles.emptyText}>No prompt today</Text>
        <Text style={styles.emptySubtext}>Start a new day to capture your moment together!</Text>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity onPress={handleStartDay} disabled={starting} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Icon name="play" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.gradientButtonText}>
              {starting ? 'Starting...' : 'Start Today'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Figure out submission status for both partners
  const submissions = currentDay.submissions || {};
  const userSubmitted = !!submissions[user.uid];
  const partnerIds = (relationship?.users || []).filter((id) => id !== user.uid);
  const partnerId = partnerIds[0];
  const partnerSubmitted = partnerId ? !!submissions[partnerId] : false;
  const bothSubmitted = userSubmitted && partnerSubmitted;

  // Calculate hours remaining from the day's end date
  const endDate = currentDay.endDate?.toDate ? currentDay.endDate.toDate() : new Date();
  const hoursLeft = getHoursRemaining(endDate);

  const firstName = userData?.name?.split(' ')[0] || 'there';

  return (
    <ScrollView style={styles.container}>
      {/* Welcome section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hey, {firstName}! 👋</Text>
        <Text style={styles.welcomeSubtext}>Here's your moment for today</Text>
      </View>

      {/* Current prompt card */}
      <PromptCard
        prompt={currentPrompt}
        hoursRemaining={hoursLeft}
        submissionStatus={{ userSubmitted, partnerSubmitted }}
      />

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Submit / replace photo — gradient button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('SubmitPhoto')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Icon name={userSubmitted ? 'image-edit' : 'camera'} size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.gradientButtonText}>
              {userSubmitted ? 'Replace Photo' : 'Submit Photo'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Reveal button — only when both submitted and not yet revealed */}
        {bothSubmitted && currentDay.status === 'active' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Reveal', {
              dayId: currentDay.dayId,
              relationshipId: currentDay.relationshipId,
            })}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <Icon name="eye" size={20} color="#FF6B6B" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>Reveal Photos</Text>
          </TouchableOpacity>
        )}

        {/* View revealed photos */}
        {currentDay.status === 'revealed' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Reveal', {
              dayId: currentDay.dayId,
              relationshipId: currentDay.relationshipId,
            })}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <Icon name="eye" size={20} color="#FF6B6B" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>View Reveal</Text>
          </TouchableOpacity>
        )}

        {/* Next day — only after reveal */}
        {(currentDay.status === 'revealed' || currentDay.status === 'completed') && (
          <TouchableOpacity
            onPress={handleStartDay}
            activeOpacity={0.8}
            style={styles.outlinedButton}
          >
            <Icon name="arrow-right" size={20} color="#FF6B6B" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>Next Day</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Streak display */}
      {relationship && (
        <View style={styles.streakContainer}>
          <View style={styles.streakPill}>
            <Icon name="fire" size={20} color="#FF6B6B" style={{ marginRight: 6 }} />
            <Text style={styles.streakText}>
              {relationship.currentStreak} day streak
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF8F0',
  },
  emptyIconCircle: {
    marginBottom: 16,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#2D2D2D',
  },
  emptySubtext: {
    color: '#8E8E8E',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  welcomeSubtext: {
    fontSize: 15,
    color: '#8E8E8E',
    marginTop: 2,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 16,
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: '#FFE0E6',
  },
  secondaryButtonText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 16,
  },
  outlinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFE0E6',
  },
  streakContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0E6',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
});
