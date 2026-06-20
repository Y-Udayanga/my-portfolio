import { Client, Databases, ID } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('693ac16b001ab8cc85b2')
    .setKey('standard_093669553d679ac828596ddb090f256a41307e77534197738f01db7267f8c38dfc9552365d96ec5597d9a463fd515e716096b83f2ba157ef19d13bb2f9961bfebf994081f604375730994b745bb930d642e61c0191bdf8d4bddd60eb1421ad30f7258bb2a059bb03d529f4bbdaa807ac2730a7c4bfbb6e59623d4eca0d4f2698');

const databases = new Databases(client);

const DATABASE_ID = '6a36c5fb000397ecca09';
const PROJECTS_COL_ID = '6a36c5fc003e715e88d3';

const projects = [
    {
        title: "Startup Validator AI 2",
        description: "An AI-powered tool built with TypeScript and React to validate startup ideas. GitHub: https://github.com/Y-Udayanga/startup-validator-AI-2",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600",
        tags: ["TypeScript", "React"],
        link: "https://startup-validator-ai-2.vercel.app"
    },
    {
        title: "Beacon Version 2",
        description: "A modern web application built with TypeScript and React. GitHub: https://github.com/Y-Udayanga/Beacon-version-2",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
        tags: ["TypeScript", "React"],
        link: "https://beacon-version-2.vercel.app"
    },
    {
        title: "Astra",
        description: "A dynamic platform built with JavaScript. GitHub: https://github.com/Y-Udayanga/Astra",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600",
        tags: ["JavaScript"],
        link: "https://astra-web-app.vercel.app/"
    },
    {
        title: "Debugliya",
        description: "A robust PHP application for debugging or management.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600",
        tags: ["PHP"],
        link: "https://github.com/Y-Udayanga/Debugliya"
    }
];

async function seed() {
    try {
        console.log("Emptying existing projects...");
        const existing = await databases.listDocuments(DATABASE_ID, PROJECTS_COL_ID);
        for (const doc of existing.documents) {
            await databases.deleteDocument(DATABASE_ID, PROJECTS_COL_ID, doc.$id);
        }
        
        console.log("Seeding new projects...");
        for (const p of projects) {
            await databases.createDocument(DATABASE_ID, PROJECTS_COL_ID, ID.unique(), p);
            console.log(`✅ Added: ${p.title}`);
        }
        console.log("All projects seeded successfully!");
    } catch (err) {
        console.error("Error seeding projects:", err);
    }
}

seed();
