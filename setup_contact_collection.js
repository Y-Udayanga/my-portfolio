import { Client, Databases, ID } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('693ac16b001ab8cc85b2')
    .setKey('standard_093669553d679ac828596ddb090f256a41307e77534197738f01db7267f8c38dfc9552365d96ec5597d9a463fd515e716096b83f2ba157ef19d13bb2f9961bfebf994081f604375730994b745bb930d642e61c0191bdf8d4bddd60eb1421ad30f7258bb2a059bb03d529f4bbdaa807ac2730a7c4bfbb6e59623d4eca0d4f2698');

const databases = new Databases(client);

const DATABASE_ID = '6a36c5fb000397ecca09';

async function setupContactCollection() {
    try {
        console.log("Creating Contact Details collection...");
        
        // Let Appwrite generate an ID
        const collection = await databases.createCollection(
            DATABASE_ID,
            ID.unique(),
            'Contact Details'
        );
        
        console.log("Collection created with ID:", collection.$id);

        // Add attributes
        console.log("Adding attributes...");
        
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'email', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'phone', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'location', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'github', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'linkedin', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'twitter', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'instagram', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collection.$id, 'facebook', 255, false);

        console.log("Attributes created.");

        // Create default contact document
        // We need to wait for attributes to be available. Polling isn't standard in the SDK, so we'll wait a few seconds.
        console.log("Waiting for attributes to be ready (5 seconds)...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        const defaultContact = {
            email: 'udayangayasindu84@gmail.com',
            phone: '+947738260',
            location: 'Sri Lanka',
            github: 'https://github.com/Y-Udayanga',
            linkedin: 'https://www.linkedin.com/in/yasindu-udayanga',
            twitter: 'https://x.com/Y_Udayanga',
            instagram: 'https://www.instagram.com/',
            facebook: 'https://www.facebook.com/'
        };

        const doc = await databases.createDocument(
            DATABASE_ID,
            collection.$id,
            ID.unique(),
            defaultContact
        );

        console.log("Default contact created!");
        console.log("Please copy this ID to your APPWRITE_CONTACT_COL_ID:", collection.$id);

    } catch (err) {
        console.error("Error setting up contact collection:", err);
    }
}

setupContactCollection();
