"use strict";

// examples of connecting to and using a MongoDB collection
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// load the contents of the .env file into environment variables
// in our program
dotenv.config();

const url = `mongodb+srv://${process.env.DB_HOST}/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tlsCertificateKeyFile=${encodeURIComponent(process.env.CERT_FILE)}`;

// create a MongoClient object
const client = new MongoClient(url);

// create an async function to connect to the server and run queries
async function run() {
    try {
    // establish a connection to the MongoDB server
    await client.connect();
    console.log("Connected successfully to server");

    // select the collection we'd like to work with
    const col = client.db("example1").collection("students");
    
    // delete existing documents (just so we can start from scratch)
    col.deleteMany({});
    console.log("deleted all documents");

    await col.insertOne({
        firstName: "Beep",
        lastName: "Boop",
        birthMonth: "February"
    });

    await col.insertOne({
        firstName: "Jaron",
        lastName: "Belmore",
        birthMonth: "August"
    });

    await col.insertOne({
        firstName: "Maggie",
        lastName: "Wenger",
        birthMonth: "March"
    });

    await col.insertOne({
        firstName: "Aidan",
        lastName: "Marler",
        birthMonth: "November"
    });

    await col.insertOne({
        firstName: "Sarah",
        lastName: "Bellefleur",
        birthMonth: "March"
    });

    // Find queries
    const q1 = await col.findOne({lastName: "Marler"});
    console.dir(q1);

    // find can return a "cursor" to the start of results
    // cursor is an iterator
    // .toArray()
    // .next() --> next document
    // .hasNext() --> is there another item to access
    const q2_cur = await col.find({
        birthMonth: {
            $in: ["March", "August"]
        }
    });
    console.log("Query 2 results: ");
    (await q2_cur.toArray()).forEach(console.dir);

    } finally {
        // Ensures that the client is disconnected, even if we
        // throw an exception
        await client.close();
        console.log("connection closed");
    }

}

// call the run function
run().catch(console.dir);