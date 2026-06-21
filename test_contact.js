import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('693ac16b001ab8cc85b2');

const databases = new Databases(client);

async function test() {
    try {
        const res = await databases.listDocuments('6a36c5fb000397ecca09', '6a36dc8a00318cff8c36');
        console.log("Success:", res);
    } catch (e) {
        console.log("Error:", e);
    }
}
test();
