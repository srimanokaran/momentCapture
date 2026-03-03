import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

// A single day cell in the calendar grid.
// Shows the day number, a thumbnail preview if photos exist, and handles tap.
export default function WeekCard({ day, dayData, isToday, onPress }) {
  if (!day) {
    // Empty cell for padding days before the 1st of the month
    return <View style={styles.cell} />;
  }

  const hasData = !!dayData;
  const submissions = dayData?.submissions || {};
  const userIds = Object.keys(submissions);
  const thumbnailUrl = userIds.length > 0
    ? submissions[userIds[0]].thumbnailUrl
    : null;

  const CellContent = () => (
    <View style={[
      styles.cell,
      isToday && styles.todayCell,
      hasData && styles.filledCell,
    ]}>
      {/* Thumbnail background if photo exists */}
      {thumbnailUrl ? (
        <View style={styles.thumbContainer}>
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbImage} />
          <View style={styles.thumbOverlay} />
          <Text style={styles.dayNumberOnPhoto}>{day}</Text>
          {userIds.length >= 2 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          <Text style={[
            styles.dayNumber,
            isToday && styles.todayNumber,
            hasData && styles.filledNumber,
          ]}>
            {day}
          </Text>
          {hasData && <View style={styles.dot} />}
        </>
      )}
    </View>
  );

  if (hasData) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CellContent />
      </TouchableOpacity>
    );
  }

  return <CellContent />;
}

const CELL_SIZE = 46;

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    margin: 2,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  filledCell: {
    // styled via thumbnail or dot
  },
  dayNumber: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  todayNumber: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  filledNumber: {
    fontWeight: '600',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF8FA3',
    marginTop: 2,
  },
  thumbContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbImage: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    resizeMode: 'cover',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
  },
  dayNumberOnPhoto: {
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF6B6B',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
