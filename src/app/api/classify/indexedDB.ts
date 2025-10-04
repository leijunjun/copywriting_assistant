import { openDB, DBSchema, IDBPDatabase } from 'idb';


export interface IClassify {
  id: number;
  chinese: string;
  english: string;
  japanese: string;
  classify_key: string;
  tool_key: string;
}

const DB_NAME = 'ai-quick-writing-tool-classify-database';
const STORE_NAME = 'ai-quick-writing-tool-classify-store';

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: IClassify
  };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
  const db = await openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}

export async function addClassifyData(data: Omit<IClassify, 'id'>): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).add(data as IClassify);
  await tx.done;
}

export async function getAllClassifyData(): Promise<Array<IClassify>> {
  const db = await initDB();
  return await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
}

export async function deleteClassifyData(id: number): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
}