"use strict";

// module to support connecting to MongoDB
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// configure dotenv
dotenv.config();
const url = `mongodb+srv://${process.env.DB_HOST}/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tlsCertificateKeyFile=${encodeURIComponent(process.env.CERT_FILE)}`;

let client;

// variable for our db
let db;

// function to initialize our db object
export async function initDb() {
    if (db) {
        console.log("trying to init DB again!");
        return;
    }

    client = new MongoClient(url);
    await client.connect();
    db = client.db("ToDoApp");
}

// function to access our db object
export function getDb() {
    if (!db) {
        throw {
            message: "Db has not been initialized. Please call initDb first!"
        }
    }

    return db;
}

export function getClient() {
    return client;
}