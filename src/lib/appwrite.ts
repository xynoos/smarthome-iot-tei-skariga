// SmartHomeSkarigaApp/src/lib/appwrite.ts

import { Client, Account, Databases } from 'appwrite';
import {
	APPWRITE_ENDPOINT,
	APPWRITE_PROJECT_ID,
	APPWRITE_DATABASE_ID,
	APPWRITE_USERS_COLLECTION_ID,
} from '../config/env';

const client = new Client();

// Appwrite SDK expects the endpoint (including /v1)
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

// Export instances
export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = APPWRITE_DATABASE_ID;
export const USERS_COLLECTION_ID = APPWRITE_USERS_COLLECTION_ID;

export default client;
