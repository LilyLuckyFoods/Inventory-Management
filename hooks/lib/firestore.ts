import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase'; // Your initialized Firebase app
import type { Product, InventoryItem, ProductFormData, InventoryFormData } from '@/types';

/**
 * Get collection path for a specific company
 */
const getCollectionPath = (companyId: string, collectionName: 'products' | 'inventory') =>
  `/companies/${companyId}/${collectionName}`;

/**
 * Listen to collection in real-time
 */
export const listenToCollection = <T>(
  companyId: string,
  collectionName: 'products' | 'inventory',
  callback: (data: T[]) => void
): Unsubscribe => {
  const path = getCollectionPath(companyId, collectionName);
  const q = query(collection(db, path));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
      callback(list);
    },
    (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      callback([]);
    }
  );
};

/**
 * Add a single product
 */
export const addProduct = async (companyId: string, product: ProductFormData) => {
  const path = getCollectionPath(companyId, 'products');
  return addDoc(collection(db, path), product);
};

/**
 * Add multiple products in a batch
 */
export const addBulkProducts = async (companyId: string, products: ProductFormData[]) => {
  const path = getCollectionPath(companyId, 'products');
  const productsCollection = collection(db, path);
  const batch = writeBatch(db);

  products.forEach((product) => {
    const docRef = doc(productsCollection);
    batch.set(docRef, product);
  });

  return batch.commit();
};

/**
 * Add inventory item
 */
export const addInventoryItem = async (companyId: string, item: InventoryFormData) => {
  const path = getCollectionPath(companyId, 'inventory');
  const totalQuantity = item.lots.reduce((sum, lot) => sum + lot.quantity, 0);
  const itemToAdd = { ...item, quantity: totalQuantity, totalSales: 0 };
  return addDoc(collection(db, path), itemToAdd);
};

/**
 * Update inventory item
 */
export const updateInventoryItem = async (
  companyId: string,
  itemId: string,
  item: Partial<InventoryItem>
) => {
  const path = getCollectionPath(companyId, 'inventory');
  const docRef = doc(db, path, itemId);

  let dataToUpdate = { ...item };
  if (item.lots) {
    const totalQuantity = item.lots.reduce((sum, lot) => sum + lot.quantity, 0);
    dataToUpdate.quantity = totalQuantity;
  }

  return updateDoc(docRef, dataToUpdate);
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = (companyId: string, itemId: string) => {
  const path = getCollectionPath(companyId, 'inventory');
  return deleteDoc(doc(db, path, itemId));
};

/**
 * Search products by name or itemNumber (exact match)
 */
export const searchProducts = async (companyId: string, keyword: string) => {
  const path = getCollectionPath(companyId, 'products');
  const productsCollection = collection(db, path);

  const qName = query(productsCollection, where('name', '==', keyword));
  const qItemNumber = query(productsCollection, where('itemNumber', '==', keyword));

  const [nameSnapshot, itemNumberSnapshot] = await Promise.all([
    getDocs(qName),
    getDocs(qItemNumber),
  ]);

  const results = [...nameSnapshot.docs, ...itemNumberSnapshot.docs];
  const uniqueResults = Array.from(new Set(results.map((doc) => doc.id))).map((id) => {
    const foundDoc = results.find((doc) => doc.id === id);
    return { id: foundDoc!.id, ...foundDoc!.data() } as Product;
  });

  return uniqueResults;
};

/**
 * Batch update inventory
 */
export const batchUpdateInventory = async (
  companyId: string,
  updates: { id: string; data: Partial<InventoryItem> }[]
) => {
  const path = getCollectionPath(companyId, 'inventory');
  const inventoryCollection = collection(db, path);
  const batch = writeBatch(db);

  updates.forEach((update) => {
    const docRef = doc(inventoryCollection, update.id);
    batch.update(docRef, update.data);
  });

  return batch.commit();
};

