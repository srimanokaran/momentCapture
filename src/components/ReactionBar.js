import React from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// The 5 emoji reactions available for each reveal
const EMOJIS = ['❤️', '😂', '🔥', '😍', '🎨'];

// Emoji reaction bar + comment input for the reveal screen.
// Emojis toggle on/off (you can select multiple).
// Comment has a send button.
export default function ReactionBar({
  selectedEmojis = [],
  onToggleEmoji,
  comment = '',
  onCommentChange,
  onSubmitComment,
}) {
  return (
    <View style={styles.container}>
      {/* Emoji row — each emoji is highlighted if selected */}
      <View style={styles.emojiRow}>
        {EMOJIS.map((emoji) => {
          const isSelected = selectedEmojis.includes(emoji);
          return (
            <TouchableOpacity
              key={emoji}
              onPress={() => onToggleEmoji(emoji)}
              style={[styles.emojiButton, isSelected && styles.emojiSelected]}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Comment input with separate send button */}
      <View style={styles.commentRow}>
        <TextInput
          placeholder="Leave a sweet note..."
          placeholderTextColor="#B0B0B0"
          value={comment}
          onChangeText={onCommentChange}
          onSubmitEditing={onSubmitComment}
          returnKeyType="send"
          style={styles.commentInput}
        />
        <TouchableOpacity
          onPress={onSubmitComment}
          disabled={!comment.trim()}
          style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
        >
          <Icon
            name="send"
            size={20}
            color={comment.trim() ? '#FFFFFF' : '#C4C4C4'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  emojiButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiSelected: {
    backgroundColor: '#FFE0E6',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 28,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0E6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2D2D2D',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
});
