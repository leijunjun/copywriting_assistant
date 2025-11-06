import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface IWriterTemplate {
  id?: number; // auto-increment
  userId: string; // 用户ID，用于隔离不同用户的数据
  name: string; // 模板名称（用户自定义，必填）
  structureContent: string; // 结构解析内容
  referenceText?: string; // 可选的参考文档内容
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

const DB_NAME = 'ai-quick-writing-tool-database';
const STORE_NAME = 'writer-templates-store';

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: IWriterTemplate;
    indexes: {
      'byUserId': string;
    };
  };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
  const db = await openDB<MyDB>(DB_NAME, 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // 如果 store 不存在，创建它
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('byUserId', 'userId');
      }
    },
  });
  return db;
}

export async function addTemplate(data: Omit<IWriterTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const now = new Date().toISOString();
  const template: Omit<IWriterTemplate, 'id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  const id = await tx.objectStore(STORE_NAME).add(template as IWriterTemplate);
  await tx.done;
  return id as number;
}

export async function getTemplate(id: number): Promise<IWriterTemplate | undefined> {
  const db = await initDB();
  return await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
}

export async function getAllTemplatesByUserId(userId: string): Promise<Array<IWriterTemplate>> {
  const db = await initDB();
  const result = await db
    .transaction(STORE_NAME, 'readonly')
    .objectStore(STORE_NAME)
    .index('byUserId')
    .getAll(userId);
  // 按创建时间倒序排列（最新的在前）
  return result.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeB - timeA;
  });
}

export async function deleteTemplate(id: number): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
}

