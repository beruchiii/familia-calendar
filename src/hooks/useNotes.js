import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'familia-notes';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Listen to Firestore notes in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notes'), (snapshot) => {
      const firebaseNotes = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      // Sort by updatedAt descending (newest first)
      firebaseNotes.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      setNotes(firebaseNotes);
      setLoaded(true);
    });

    return () => unsub();
  }, []);

  // Migrate localStorage data to Firebase (one-time)
  useEffect(() => {
    if (!loaded) return;

    const localNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localNotes) {
      const parsed = JSON.parse(localNotes);
      if (parsed.length > 0 && notes.length === 0) {
        const batch = writeBatch(db);
        parsed.forEach(note => {
          const { id, ...data } = note;
          const ref = doc(collection(db, 'notes'));
          batch.set(ref, { ...data, _oldId: id });
        });
        batch.commit().then(() => {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          console.log('Notes migrated to Firebase');
        });
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [loaded]);

  const addNote = useCallback((note) => {
    const newNote = {
      ...note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Remove undefined values
    const clean = Object.fromEntries(
      Object.entries(newNote).filter(([, v]) => v !== undefined)
    );
    addDoc(collection(db, 'notes'), clean);
    return { ...clean, id: 'temp-' + Date.now() };
  }, []);

  const updateNote = useCallback((id, updates) => {
    const clean = Object.fromEntries(
      Object.entries({ ...updates, updatedAt: new Date().toISOString() })
        .filter(([, v]) => v !== undefined)
    );
    updateDoc(doc(db, 'notes', id), clean);
  }, []);

  const deleteNote = useCallback((id) => {
    deleteDoc(doc(db, 'notes', id));
  }, []);

  return { notes, addNote, updateNote, deleteNote };
}
