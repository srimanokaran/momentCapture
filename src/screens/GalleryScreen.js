import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRelationship } from '../contexts/RelationshipContext';
import { getAllDays } from '../services/promptService';
import WeekCard from '../components/WeekCard';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Convert a Firestore Timestamp or Date to "YYYY-MM-DD"
function toDateKey(startDate) {
  if (!startDate) return null;
  const date = startDate.toDate ? startDate.toDate() : new Date(startDate);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function GalleryScreen({ navigation }) {
  const { relationshipId } = useRelationship();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    loadDays();
  }, [relationshipId]);

  const loadDays = async () => {
    if (!relationshipId) return;
    try {
      const allDays = await getAllDays(relationshipId);
      const completedDays = allDays.filter(
        (d) => d.status === 'revealed' || d.status === 'completed'
      );
      setDays(completedDays);
    } catch (err) {
      console.log('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build a lookup: "YYYY-MM-DD" (from startDate) -> dayData
  const dayMap = useMemo(() => {
    const map = {};
    days.forEach((d) => {
      const key = toDateKey(d.startDate);
      if (key) map[key] = d;
    });
    return map;
  }, [days]);

  const { year, month } = currentMonth;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calendar grid data
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const calendarRows = useMemo(() => {
    const rows = [];
    let row = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      row.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(d);
      if (row.length === 7) {
        rows.push(row);
        row = [];
      }
    }
    if (row.length > 0) {
      while (row.length < 7) row.push(null);
      rows.push(row);
    }
    return rows;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Find the most recent completed day in the currently viewed month
  const lastMoment = useMemo(() => {
    if (days.length === 0) return null;
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    // days are sorted most recent first
    return days.find((d) => {
      const key = toDateKey(d.startDate);
      return key && key.startsWith(monthPrefix);
    }) || null;
  }, [days, year, month]);

  const lastMomentDateLabel = useMemo(() => {
    if (!lastMoment) return '';
    const date = lastMoment.startDate?.toDate
      ? lastMoment.startDate.toDate()
      : new Date(lastMoment.startDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [lastMoment]);

  // Count moments in this month
  const momentCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (dayMap[key]) count++;
    }
    return count;
  }, [dayMap, year, month, daysInMonth]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (days.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIconCircle}>
          <Icon name="calendar-heart" size={48} color="#FF6B6B" />
        </View>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No moments yet
        </Text>
        <Text style={styles.emptySubtext}>
          Complete your first day to start{'\n'}filling your calendar together!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Month header with arrows */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Icon name="chevron-left" size={28} color="#2D2D2D" />
        </TouchableOpacity>
        <View style={styles.monthTitleContainer}>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[month]} {year}
          </Text>
          {momentCount > 0 && (
            <Text style={styles.momentCount}>
              {momentCount} moment{momentCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Icon name="chevron-right" size={28} color="#2D2D2D" />
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.weekLabelRow}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.weekLabelCell}>
            <Text style={styles.weekLabelText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {calendarRows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.weekRow}>
          {row.map((day, colIdx) => {
            const dateKey = day
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : null;
            const dayData = dateKey ? dayMap[dateKey] : null;
            const isToday = dateKey === todayStr;

            return (
              <WeekCard
                key={colIdx}
                day={day}
                dayData={dayData}
                isToday={isToday}
                onPress={dayData ? () => navigation.navigate('Reveal', {
                  dayId: dayData.dayId,
                  relationshipId: dayData.relationshipId,
                }) : undefined}
              />
            );
          })}
        </View>
      ))}

      {/* Last Moment — shown below calendar */}
      {!lastMoment && (
        <View style={styles.emptyMonth}>
          <Icon name="camera-off" size={56} color="#C4C4C4" />
          <Text style={styles.emptyMonthText}>No moments this month</Text>
        </View>
      )}
      {lastMoment && (() => {
        const subs = lastMoment.submissions || {};
        const uids = Object.keys(subs);
        if (uids.length === 0) return null;
        return (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Reveal', {
              dayId: lastMoment.dayId,
              relationshipId: lastMoment.relationshipId,
            })}
          >
            <View style={styles.lastMomentCard}>
              <View style={styles.lastMomentHeader}>
                <Icon name="heart" size={16} color="#FF8FA3" />
                <Text style={styles.lastMomentLabel}>{lastMomentDateLabel}</Text>
              </View>
              <Text style={styles.lastMomentPrompt} numberOfLines={2}>
                {lastMoment.prompt?.title || 'Unknown prompt'}
              </Text>
              <View style={styles.lastMomentPhotos}>
                {uids.map((uid) => (
                  <View key={uid} style={styles.lastMomentPhotoFrame}>
                    <Image
                      source={{ uri: subs[uid].thumbnailUrl || subs[uid].photoUrl }}
                      style={styles.lastMomentPhoto}
                    />
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        );
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF8F0',
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFE0E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    marginBottom: 8,
    color: '#2D2D2D',
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#8E8E8E',
    textAlign: 'center',
    lineHeight: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  navButton: {
    padding: 8,
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  momentCount: {
    fontSize: 12,
    color: '#FF8FA3',
    fontWeight: '600',
    marginTop: 2,
  },
  weekLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekLabelCell: {
    width: 46,
    alignItems: 'center',
    margin: 2,
  },
  weekLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E8E',
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  emptyMonth: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyMonthText: {
    fontSize: 18,
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  lastMomentCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#FF8FA3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lastMomentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastMomentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF8FA3',
    marginLeft: 6,
  },
  lastMomentPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 12,
  },
  lastMomentPhotos: {
    flexDirection: 'row',
    gap: 10,
  },
  lastMomentPhotoFrame: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFE0E6',
  },
  lastMomentPhoto: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
});
