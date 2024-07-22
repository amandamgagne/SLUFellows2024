"use strict";
// Note we are assuming that this script is run from the parent directory

// import modules for processing CSVs, loading environment variables, and connecting to MongoDB
import csv from "csvtojson";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// load environment variables
dotenv.config();

// define MongoDB connection string 
const url = `mongodb+srv://${process.env.DB_HOST}/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&tlsCertificateKeyFile=${encodeURIComponent(process.env.CERT_FILE)}`;

// create a MongoClient object
const client = new MongoClient(url);

// function to run all processing and queries
async function run() {
  try {
    // load zipcodes.csv and transform it to json
    // note that we are assuming zipcodes.csv is in the same directory as this file
    const data = await csv({
      colParser: {
        "EstimatedPopulation": "number",
        "Lat": "number",
        "Long": "number",
        "TaxReturnsFiled": "number",
        "TotalWages": "number",
        "Decommisioned": (n) => n.toLowerCase() === "true"
      }
    }).fromFile("./zipcodes/zipcodes.csv");

    // connect to the client
    await client.connect();
    console.log("Connected successfully to server");

    // select the database and collection we want to use
    const col = client.db(process.env.DB_NAME).collection("zips");

    // delete any existing documents in the collection
    await col.deleteMany({});
    console.log("deleted all existing documents");

    // insert the data into the database
    await col.insertMany(data);
    console.log(`Inserted ${data.length} documents`);

  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
    console.log("Closed connection to server");
  }
};

// run the program
run().catch(console.dir);