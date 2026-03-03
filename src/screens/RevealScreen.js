import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ReactionBar from '../components/ReactionBar';
import { markAsRevealed, addReaction, addComment } from '../services/promptService';
import { getDayDetails } from '../services/promptService';

// Shows both partners' photos side-by-side after reveal.
// Before reveal: shows a "Mark as Revealed" button.
// After reveal: shows photos, captions, and the reaction bar.
export default function RevealScreen({ route }) {
  const { dayId, relationshipId } = route.params;
  const { user } = useAuth();
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmojis, setSelectedEmojis] = useState([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Fetch the day's data (submissions, reactions, status)
  useEffect(() => {
    loadDayData();
  }, []);

  const loadDayData = async () => {
    try {
      console.log('Loading reveal data for:', relationshipId, dayId);
      const data = await getDayDetails(relationshipId, dayId);
      console.log('Reveal data:', data ? 'found' : 'null');
      setDayData(data);

      // Pre-fill user's existing emoji reactions
      const myReactions = data?.reactions?.[user.uid];
      if (myReactions) {
        setSelectedEmojis(myReactions.emojis || []);
      }
    } catch (err) {
      setError('Failed to load reveal data.');
    } finally {
      setLoading(false);
    }
  };

  // Mark the day as revealed (manual MVP flow)
  const handleReveal = async () => {
    try {
      await markAsRevealed(relationshipId, dayId);
      await loadDayData(); // Refresh to show revealed state
    } catch (err) {
      setError('Failed to reveal. Try again.');
    }
  };

  // Toggle an emoji reaction on/off
  const handleToggleEmoji = async (emoji) => {
    const isRemoving = selectedEmojis.includes(emoji);
    const updated = isRemoving
      ? selectedEmojis.filter((e) => e !== emoji)
      : [...selectedEmojis, emoji];
    setSelectedEmojis(updated);

    try {
      await addReaction(relationshipId, dayId, user.uid, emoji, isRemoving);
      await loadDayData(); // refresh to show updated reactions
    } catch (err) {
      // revert on failure
      setSelectedEmojis(selectedEmojis);
      setError('Failed to save reaction.');
    }
  };

  // Submit a text comment
  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    const savedComment = comment;
    try {
      console.log('Submitting comment:', savedComment, 'dayId:', dayId, 'relationshipId:', relationshipId, 'uid:', user.uid);
      await addComment(relationshipId, dayId, user.uid, savedComment);
      console.log('Comment saved OK');
      setComment('');
      await loadDayData();
    } catch (err) {
      console.log('Comment error:', err.code, err.message);
      setComment(savedComment);
      setError('Failed to save comment.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!dayData) {
    return (
      <View style={styles.centered}>
        <Text>No data found.</Text>
      </View>
    );
  }

  const submissions = dayData.submissions || {};
  const userIds = Object.keys(submissions);
  const isRevealed = dayData.status === 'revealed' || dayData.status === 'completed';

  return (
    <View style={styles.container}>
    <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
      {/* Header with star icon and prompt title */}
      <View style={styles.headerSection}>
        <Icon name="star-four-points" size={28} color="#FFB347" style={{ marginBottom: 8 }} />
        <Text variant="titleLarge" style={styles.promptTitle}>
          {dayData.prompt?.title || "Today's prompt"}
        </Text>
      </View>

      {/* Not yet revealed — show reveal button */}
      {!isRevealed && (
        <View style={styles.preReveal}>
          <View style={styles.eyeCircle}>
            <Icon name="eye-off" size={36} color="#FF6B6B" />
          </View>
          <Text style={styles.hiddenText}>Photos are hidden until revealed!</Text>
          <TouchableOpacity onPress={handleReveal} activeOpacity={0.8}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Icon name="eye" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.gradientButtonText}>Reveal Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Revealed — show both photos side by side */}
      {isRevealed && (
        <>
          <View style={styles.photoRow}>
            {userIds.map((uid) => (
              <View key={uid} style={styles.photoContainer}>
                <View style={styles.photoFrame}>
                  <Image
                    source={{ uri: submissions[uid].photoUrl }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </View>
                {/* Caption below the photo */}
                {submissions[uid].caption ? (
                  <Text style={styles.caption}>{submissions[uid].caption}</Text>
                ) : null}
              </View>
            ))}
          </View>

          {/* Emoji reactions summary */}
          {userIds.map((uid) => {
            const reactions = dayData.reactions?.[uid];
            if (!reactions?.emojis?.length) return null;
            const isMe = uid === user.uid;
            return (
              <View key={uid} style={styles.emojiSummary}>
                <Text style={styles.emojiSummaryLabel}>{isMe ? 'You' : 'Partner'}</Text>
                <Text style={styles.emojiSummaryEmojis}>{reactions.emojis.join(' ')}</Text>
              </View>
            );
          })}

          {/* Comments thread */}
          {dayData.comments?.length > 0 && (
            <View style={styles.commentsThread}>
              <Text style={styles.commentsTitle}>Comments</Text>
              {dayData.comments.map((c, idx) => {
                const isMe = c.userId === user.uid;
                return (
                  <View key={idx} style={[styles.commentBubble, isMe ? styles.myBubble : styles.partnerBubble]}>
                    <Text style={styles.commentAuthor}>{isMe ? 'You' : 'Partner'}</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Your reaction bar */}
          <ReactionBar
            selectedEmojis={selectedEmojis}
            onToggleEmoji={handleToggleEmoji}
            comment={comment}
            onCommentChange={setComment}
            onSubmitComment={handleSubmitComment}
          />
        </>
      )}

    </ScrollView>

    <Snackbar visible={!!error} onDismiss={() => setError('')} duration={3000}>
      {error}
    </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF8F0',
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
  },
  promptTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 16,
    color: '#2D2D2D',
  },
  preReveal: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  eyeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE0E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  hiddenText: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 24,
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
  photoRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  photoContainer: {
    flex: 1,
  },
  photoFrame: {
    borderWidth: 3,
    borderColor: '#FFE0E6',
    borderRadius: 20,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 250,
  },
  caption: {
    textAlign: 'center',
    marginTop: 8,
    color: '#8E8E8E',
    fontStyle: 'italic',
  },
  emojiSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
    gap: 8,
  },
  emojiSummaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E8E',
  },
  emojiSummaryEmojis: {
    fontSize: 20,
  },
  commentsThread: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 10,
  },
  commentBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '85%',
  },
  myBubble: {
    backgroundColor: '#FFE0E6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  commentAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E8E',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: '#2D2D2D',
    lineHeight: 20,
  },
});
