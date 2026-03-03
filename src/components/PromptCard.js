import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Color map for prompt categories — each category gets a distinct chip color
const CATEGORY_COLORS = {
  nostalgic: '#FFD4A8',
  symbolic: '#E8B4F0',
  creative: '#A8E6CF',
  challenge: '#FF8FA3',
  silly: '#FFE066',
};

// Displays today's prompt with countdown and submission status.
// Shows the prompt title, description, a colored category chip,
// how many hours are left, and whether each partner has submitted.
export default function PromptCard({ prompt, hoursRemaining, submissionStatus }) {
  if (!prompt) return null;

  return (
    <Card style={styles.card}>
      {/* Gradient accent stripe */}
      <LinearGradient
        colors={['#FF6B6B', '#FFB347']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.accentStripe}
      />

      <Card.Content style={styles.cardContent}>
        {/* Category chip */}
        <Chip
          style={[styles.chip, { backgroundColor: CATEGORY_COLORS[prompt.category] || '#ddd' }]}
          textStyle={styles.chipText}
        >
          {prompt.category}
        </Chip>

        {/* Prompt title and description */}
        <Text variant="headlineSmall" style={styles.title}>{prompt.title}</Text>
        <Text variant="bodyMedium" style={styles.description}>{prompt.description}</Text>

        {/* Countdown pill */}
        <View style={styles.countdownPill}>
          <Icon name="clock-outline" size={16} color="#FF6B6B" style={{ marginRight: 6 }} />
          <Text style={styles.countdownText}>
            {hoursRemaining > 1 ? `${hoursRemaining} hours remaining` : 'Less than an hour!'}
          </Text>
        </View>

        {/* Submission status for both partners */}
        {submissionStatus && (
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Icon
                name={submissionStatus.userSubmitted ? 'check-circle' : 'circle-outline'}
                size={18}
                color={submissionStatus.userSubmitted ? '#FF6B6B' : '#C4C4C4'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.status, submissionStatus.userSubmitted && styles.statusDone]}>
                You: {submissionStatus.userSubmitted ? 'Submitted' : 'Not yet'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Icon
                name={submissionStatus.partnerSubmitted ? 'check-circle' : 'circle-outline'}
                size={18}
                color={submissionStatus.partnerSubmitted ? '#FF6B6B' : '#C4C4C4'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.status, submissionStatus.partnerSubmitted && styles.statusDone]}>
                Partner: {submissionStatus.partnerSubmitted ? 'Submitted' : 'Waiting...'}
              </Text>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 3,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF8FA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  accentStripe: {
    height: 4,
  },
  cardContent: {
    padding: 20,
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2D2D2D',
  },
  description: {
    color: '#8E8E8E',
    marginBottom: 12,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0E6',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginBottom: 12,
  },
  countdownText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE0E6',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  statusDone: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
});
