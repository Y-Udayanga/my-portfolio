import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('693ac16b001ab8cc85b2')
    .setKey('standard_093669553d679ac828596ddb090f256a41307e77534197738f01db7267f8c38dfc9552365d96ec5597d9a463fd515e716096b83f2ba157ef19d13bb2f9961bfebf994081f604375730994b745bb930d642e61c0191bdf8d4bddd60eb1421ad30f7258bb2a059bb03d529f4bbdaa807ac2730a7c4bfbb6e59623d4eca0d4f2698');

const databases = new Databases(client);
const DATABASE_ID = '6a36c5fb000397ecca09';

const attributes = [
    ['title', 200, true],
    ['event', 200, true],
    ['role', 120, false],
    ['date', 80, false],
    ['location', 160, false],
    ['team', 200, false],
    ['result', 160, false],
    ['technologies', 500, false],
    ['description', 8000, true],
    ['link', 500, false],
    ['image', 2048, false],
];

async function setupHackathonCollection() {
    const collection = await databases.createCollection(
        DATABASE_ID,
        ID.unique(),
        'Hackathons',
        [
            Permission.read(Role.any()),
            Permission.create(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any()),
        ]
    );

    console.log('COLLECTION_ID', collection.$id);

    for (const [key, size, required] of attributes) {
        await databases.createStringAttribute(DATABASE_ID, collection.$id, key, size, required);
        console.log('ATTRIBUTE', key);
    }

    for (let attempt = 0; attempt < 20; attempt++) {
        const listed = await databases.listAttributes(DATABASE_ID, collection.$id);
        const ready = listed.attributes.length >= attributes.length
            && listed.attributes.every((attribute) => attribute.status === 'available');
        if (ready) {
            console.log('READY');
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error('Hackathon attributes were not ready in time.');
}

setupHackathonCollection().catch((error) => {
    console.error(error?.message || error);
    process.exit(1);
});
