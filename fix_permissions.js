import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('693ac16b001ab8cc85b2')
    .setKey('standard_093669553d679ac828596ddb090f256a41307e77534197738f01db7267f8c38dfc9552365d96ec5597d9a463fd515e716096b83f2ba157ef19d13bb2f9961bfebf994081f604375730994b745bb930d642e61c0191bdf8d4bddd60eb1421ad30f7258bb2a059bb03d529f4bbdaa807ac2730a7c4bfbb6e59623d4eca0d4f2698');

const databases = new Databases(client);

async function fixPermissions() {
    try {
        await databases.updateCollection(
            '6a36c5fb000397ecca09',
            '6a36dc8a00318cff8c36',
            'Contact Details',
            [
                Permission.read(Role.any()),
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );
        console.log("Permissions updated successfully.");
    } catch (e) {
        console.error("Error updating permissions:", e);
    }
}
fixPermissions();
