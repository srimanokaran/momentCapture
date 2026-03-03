import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import * as promptService from '../services/promptService';

const RelationshipContext = createContext(null);

// Provides relationship and daily prompt data to the app.
// Fetches the most recent active round and listens to it in real-time
// so the UI updates when your partner submits or reacts.
export function RelationshipProvider({ children }) {
  const { userData } = useAuth();
  const [relationship, setRelationship] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  // Bump this to trigger a re-fetch of the current day
  const [refreshKey, setRefreshKey] = useState(0);

  const relationshipId = userData?.relationshipId;

  // Listen to the relationship document for real-time streak/stats updates
  useEffect(() => {
    if (!relationshipId) {
      setRelationship(null);
      setLoading(false);
      return;
    }

    const unsubRelationship = onSnapshot(
      doc(db, 'relationships', relationshipId),
      (snapshot) => {
        if (snapshot.exists()) {
          setRelationship({ id: snapshot.id, ...snapshot.data() });
        }
        setLoading(false);
      }
    );

    return unsubRelationship;
  }, [relationshipId]);

  // Fetch the current active round, then listen to it in real-time.
  // Re-runs when refreshKey changes (after advancing to next day).
  useEffect(() => {
    if (!relationshipId) {
      setCurrentDay(null);
      setCurrentPrompt(null);
      return;
    }

    let unsubDay = null;

    // First, find the current active round
    promptService.getCurrentDayPrompt(relationshipId).then((dayData) => {
      if (!dayData) {
        setCurrentDay(null);
        setCurrentPrompt(null);
        setLoading(false);
        return;
      }

      // Now listen to this specific round doc for real-time updates
      // (partner submits, reactions added, status changes)
      unsubDay = onSnapshot(
        doc(db, 'dailyPrompts', dayData.id),
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = { id: snapshot.id, ...snapshot.data() };
            setCurrentDay(data);

            // Fetch prompt details
            const promptDoc = await getDoc(doc(db, 'prompts', data.promptId));
            if (promptDoc.exists()) {
              setCurrentPrompt({ id: promptDoc.id, ...promptDoc.data() });
            }
          } else {
            setCurrentDay(null);
            setCurrentPrompt(null);
          }
          setLoading(false);
        }
      );
    }).catch((err) => {
      console.log('Error fetching current day:', err.message);
      setLoading(false);
    });

    return () => {
      if (unsubDay) unsubDay();
    };
  }, [relationshipId, refreshKey]);

  // Advance to next day, then refresh the context to pick up the new round
  const advanceToNextDay = useCallback(async () => {
    await promptService.advanceToNextDay(relationshipId);
    setRefreshKey((k) => k + 1);
  }, [relationshipId]);

  const value = {
    relationship,
    currentDay,
    currentPrompt,
    loading,
    relationshipId,
    advanceToNextDay,
  };

  return (
    <RelationshipContext.Provider value={value}>
      {children}
    </RelationshipContext.Provider>
  );
}

// Hook to access relationship data from any component
export function useRelationship() {
  const context = useContext(RelationshipContext);
  if (!context) throw new Error('useRelationship must be used within a RelationshipProvider');
  return context;
}
