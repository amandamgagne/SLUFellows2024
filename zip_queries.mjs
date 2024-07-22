"use strict";

// examples of queries using the zipcode database
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
    const col = client.db(process.env.DB_NAME).collection("zips");

    // find all documents with the zip code 13617
    let canton = await col.findOne({
        Zipcode: "13617"
    });

    // limit the output to City, State, Lat, Long
    // project method to specify the document fields we'd like to show
    // has to be used with find rather than findOne
    canton = await col.find({
        Zipcode: "13617"
    }).project({
        City: 1,
        State: 1,
        Lat: 1,
        Long: 1,
        _id: 0 // exclude the _id field (Only time we can have both include and exclude)
    }).next(); // call next to get the next document from the cursor

    console.log(canton);

    // find all of the zipcodes that are north of the 38th parallel in Virginia
    let north_of_38 = await col.countDocuments({
        State: "VA",
        Lat: {
            $gt: 38
        }
    });

    console.log(north_of_38);

    // find the document for the zip that is furthest west in NY
    // smallest Long will be furthest west
    // reverse sort results by Long then first document is furthest west
    let furthest_west_ny = await col.find({
        State: "NY",
    }).sort({
        Long: 1
    }).limit(1).next();

    console.log(furthest_west_ny);

    // now, let's find the furthest west zip in every state
    // require a aggregate operation to find
    // Group operation to group all of the items by state
    // create a field in the results that grabs the min value of Long from that state
    let furthest_west_everywhere = await col.aggregate([
        {
            $match: {
                State: {
                    $in: ["NY", "CA", "FL"]
                }
            }
        },
        {
            $group: {
                _id: "$State", // State field from the match will control our group
                Long: {
                    $min: "$Long" // $abs, $max, $min, $avg
                }
            }
        }
    ]).toArray();

    console.log(furthest_west_everywhere);

    /**
     * 1. Find maximum zip code in NY
     * 2. How many zip codes in Alaska? :)
     * 3. What is the average population for each zip code in Wyoming?
     * 4. How many zip codes of each type are there in DC?
     * 5. How many zip codes are there in Los Angeles, CA? :)
     * 6. What are the zip codes for Plainview TX?
     * 7. What city has the zip code 48198? :)
     * 8. What zip code is furthest North?
     * 9. What zip code is furthest West?
     * 10. What standard zip code is furthest East in New York? :)
     */

    console.log("Practice Problems");

    let question_2 = await col.countDocuments({
        State: "AK"
    });

    console.log(question_2);

    let question_4 = await col.aggregate([
        {
            $match: {
                State: "DC"
            }
        },
        {
            $group: {
                _id: "$ZipCodeType",
                Type: {
                    $sum: 1
                }
            }
        }
    ]).toArray();

    console.log(question_4);

    let question_5 = await col.countDocuments({
        State: "CA",
        City: "LOS ANGELES"
    });

    console.log(question_5);

    let question_7 = await col.findOne({
        Zipcode: "48198"
    });

    console.log(question_7);

    let question_10 = await col.find({
        State: "NY",
    }).sort({
        Long: -1
    }).limit(1).next();

    console.log(question_10);

    } finally {
        // Ensures that the client is disconnected, even if we
        // throw an exception
        await client.close();
        console.log("connection closed");
    }

}

// call the run function
run().catch(console.dir);