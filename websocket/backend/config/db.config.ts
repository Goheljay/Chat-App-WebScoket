import mongodb, { MongoClient, MongoServerSelectionError, MongoNetworkError } from 'mongodb';

let client: mongodb.MongoClient | null = null
let db: mongodb.Db | null = null

// Custom error class for database connection issues
export class DatabaseConnectionError extends Error {
    constructor(message: string = 'Database is down') {
        super(message);
        this.name = 'DatabaseConnectionError';
    }
}

// Helper function to check if error is a database connection error
const isDatabaseConnectionError = (error: any): boolean => {
    return (
        error instanceof MongoServerSelectionError ||
        error instanceof MongoNetworkError ||
        error instanceof DatabaseConnectionError ||
        (error?.cause?.code === 'ECONNREFUSED') ||
        (error?.code === 'ECONNREFUSED')
    );
};

// Wrapper to handle database errors
const handleDatabaseError = (error: any): never => {
    if (isDatabaseConnectionError(error)) {
        throw new DatabaseConnectionError('Database is down');
    }
    throw error;
};


export const connectDb = async () => {
    const mongoUri: string = 'mongodb://root:rootpassword@192.168.11.170:27017'
    if (client && db) return getCollection('user');

    try {
        client = new MongoClient(mongoUri);
        await client.connect();
        db = client.db('chat_app');

        const userCollection: mongodb.Collection = db.collection('users')
        return { user: userCollection }
    } catch (error) {
        console.error('Error connecting to database', error);
        handleDatabaseError(error);
        throw error; // This will never execute but satisfies TypeScript
    }
}

export const getDb = (): mongodb.Db => {
    if (!db) throw new Error('Database not connected');
    return db
}

export const getCollection = async (name: string): Promise<mongodb.Collection> => {
    if (!db) throw new DatabaseConnectionError('Database not connected');
    try {
        const collections = await db.listCollections({ name }).toArray();
        console.log(collections.length);
        if (collections.length === 0) {
            throw new Error(`Collection '${name}' does not exist`);
        }
        return db.collection(name);
    } catch (error) {
        handleDatabaseError(error);
        throw error; // This will never execute but satisfies TypeScript
    }
}

export const closeDb = async (): Promise<void> => {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}