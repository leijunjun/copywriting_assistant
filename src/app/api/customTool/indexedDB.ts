import { IFrom, Language } from '@/constant/tool_list';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface ICustomTool {
  id: number;
  title: string;
  name: Language;
  describe: Language;
  classify_key: string;
  url: string;
  prompt: string;
  tool_key: string;
  resultType: string;
  submitButton: string;
  from: IFrom;
  classify: Language;
}

const DB_NAME = 'ai-quick-writing-custom-tool-database';
const STORE_NAME = 'ai-quick-writing-custom-tool-store';

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: ICustomTool
    indexes: {
      'byClassifyKey': string;
    };
  };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
  const db = await openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('byClassifyKey', 'classify_key');
      }
    },
  });
  return db;
}

export async function addCustomToolData(data: Omit<ICustomTool, 'id'>): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).add(data as ICustomTool);
  await tx.done;
}

export async function getAllCustomToolData(): Promise<Array<ICustomTool>> {
  const db = await initDB();
  return await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
}

export async function deleteCustomToolData(id: number): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
}

export async function deleteCustomToolDataKey(classify_key: string): Promise<ICustomTool[]> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('byClassifyKey');

  const matchedRecords = await index.getAll(classify_key);

  for (const record of matchedRecords) {
    await store.delete(record.id); 
  }

  await tx.done;
  return matchedRecords
}

export async function updateCustomToolData(id: number, updatedData: Partial<ICustomTool>): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const existingData = await store.get(id);
  if (!existingData) {
    throw new Error(`No data found for ID: ${id}`);
  }

  const newData = { ...existingData, ...updatedData };
  await store.put(newData);
  await tx.done;
}
