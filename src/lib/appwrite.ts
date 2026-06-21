import { Client, Account, Databases, Storage } from "appwrite";

export const APPWRITE_DATABASE_ID = "6a36c5fb000397ecca09";
export const APPWRITE_PROJECTS_COL_ID = "6a36c5fc003e715e88d3";
export const APPWRITE_CERTIFICATES_COL_ID = "6a36c60600152cfb9b49";
export const APPWRITE_MESSAGES_COL_ID = "6a36c611000818198da2";
export const APPWRITE_CONTACT_COL_ID = "6a36dc8a00318cff8c36";
export const APPWRITE_STORAGE_BUCKET_ID = "6a382238002d45bcea9d";

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("693ac16b001ab8cc85b2");

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage };
