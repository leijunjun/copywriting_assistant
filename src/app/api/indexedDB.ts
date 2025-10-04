import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface IData {
  id: number;
  toolId: string | number;
  output: string;
  createdAt: string;
}

const DB_NAME = 'ai-quick-writing-tool-database';
const STORE_NAME = 'ai-quick-writing-tool-store';

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: IData
    indexes: {
      'byToolId': string | number;
    };
  };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
  const db = await openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('byToolId', 'toolId');  // Create index
      }
    },
  });
  return db;
}

export async function addData(data: IData): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).add(data);
  await tx.done;
}

export async function getData(id: number): Promise<IData | undefined> {
  const db = await initDB();
  return await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
}

export async function getAllData(): Promise<Array<IData>> {
  const db = await initDB();
  return await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
}

export async function getDataById(toolId: string | number): Promise<Array<IData>> {
  const db = await initDB();
  const reault = await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).index('byToolId').getAll(toolId);
  return reault.sort((a, b) => b.id - a.id);
}

export async function deleteData(id: number): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
}

export async function deleteDatas(ids: number[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');  
  const store = tx.objectStore(STORE_NAME);
  for (const id of ids) {
    await store.delete(id); 
  }
  await tx.done; 
}

export async function deleteDatasTool(toolId: string[] | number[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('byToolId');

  // Retrieve all records that match the classic_key
  for (let i = 0; i < toolId.length; i++) {
    const matchedRecords = await index.getAll(toolId[i]);
    for (const record of matchedRecords) {
      await store.delete(record.id);
    }
  }

  await tx.done;
}