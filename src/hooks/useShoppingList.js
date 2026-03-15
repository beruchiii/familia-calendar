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
  query,
  where,
} from 'firebase/firestore';

export function useShoppingList() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'shopping'), (snapshot) => {
      const firebaseItems = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      firebaseItems.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      setItems(firebaseItems);
      setLoaded(true);
    });

    return () => unsub();
  }, []);

  const addItem = useCallback((name, category = 'Otros') => {
    const newItem = {
      name: name.trim(),
      checked: false,
      category,
      createdAt: new Date().toISOString(),
    };
    addDoc(collection(db, 'shopping'), newItem);
  }, []);

  const toggleItem = useCallback((id, currentChecked) => {
    updateDoc(doc(db, 'shopping', id), { checked: !currentChecked });
  }, []);

  const deleteItem = useCallback((id) => {
    deleteDoc(doc(db, 'shopping', id));
  }, []);

  const clearCompleted = useCallback(() => {
    const completed = items.filter(i => i.checked);
    if (completed.length === 0) return;
    const batch = writeBatch(db);
    completed.forEach(item => {
      batch.delete(doc(db, 'shopping', item.id));
    });
    batch.commit();
  }, [items]);

  return { items, loaded, addItem, toggleItem, deleteItem, clearCompleted };
}
