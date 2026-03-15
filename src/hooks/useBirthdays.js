import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

/**
 * Calcula los días hasta la próxima ocurrencia de un cumpleaños/aniversario.
 * @param {string} mmdd - Fecha en formato "MM-DD"
 * @returns {number} Días hasta la próxima ocurrencia (0 = hoy)
 */
export function getDaysUntil(mmdd) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [month, day] = mmdd.split('-').map(Number);
  const thisYear = today.getFullYear();

  let next = new Date(thisYear, month - 1, day);
  next.setHours(0, 0, 0, 0);

  if (next < today) {
    next = new Date(thisYear + 1, month - 1, day);
    next.setHours(0, 0, 0, 0);
  }

  const diffMs = next.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function useBirthdays() {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'birthdays'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      // Sort by days until next occurrence
      data.sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
      setBirthdays(data);
    });
    return () => unsub();
  }, []);

  const addBirthday = useCallback((birthday) => {
    const clean = Object.fromEntries(
      Object.entries(birthday).filter(([, v]) => v !== undefined)
    );
    addDoc(collection(db, 'birthdays'), clean);
  }, []);

  const updateBirthday = useCallback((id, updates) => {
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    updateDoc(doc(db, 'birthdays', id), clean);
  }, []);

  const deleteBirthday = useCallback((id) => {
    deleteDoc(doc(db, 'birthdays', id));
  }, []);

  return { birthdays, addBirthday, updateBirthday, deleteBirthday };
}
