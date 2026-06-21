import { Client, Storage, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('693ac16b001ab8cc85b2')
    .setKey('standard_093669553d679ac828596ddb090f256a41307e77534197738f01db7267f8c38dfc9552365d96ec5597d9a463fd515e716096b83f2ba157ef19d13bb2f9961bfebf994081f604375730994b745bb930d642e61c0191bdf8d4bddd60eb1421ad30f7258bb2a059bb03d529f4bbdaa807ac2730a7c4bfbb6e59623d4eca0d4f2698');

const storage = new Storage(client);

async function setupStorageBucket() {
    try {
        console.log("Creating Storage Bucket...");
        
        const bucket = await storage.createBucket(
            ID.unique(),
            'Portfolio Images',
            [
                Permission.read(Role.any()),
                Permission.write(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ],
            false, // fileSecurity
            true, // enabled
            10485760, // maximumFileSize
            ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'], // allowedFileExtensions
            'none', // compression
            false, // encryption
            false // antivirus
        );
        
        console.log("Bucket created successfully!");
        console.log("------------------------------------------");
        console.log("NEW BUCKET ID: " + bucket.$id);
        console.log("------------------------------------------");
        
    } catch (err) {
        console.error("Error setting up storage bucket:", err);
    }
}

setupStorageBucket();
