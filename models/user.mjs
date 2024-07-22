"use strict";

// data model for interacting with user accounts
import argon2 from "argon2";
import { getDb } from "./db.mjs";
import sanitize from "mongo-sanitize";

// configure the argon2 hash function to best practices
const argon_config = {
    type: argon2.argon2id,
    memoryCost: 15360 // in KiB
};

export async function createUser(username, password) {
    // FIXME: verify this username is not a duplicate
    const col = getDb().collection("users");

    // hash the password
    const user_data = {
        username: sanitize(username),
        password: await argon2.hash(password, argon_config)
    };

    const result = await col.insertOne(user_data);

    return {
        ...user_data,
        _id: result.insertedId
    };

}

export async function validateUser(username, password) {
    const col = getDb().collection("users");

    const user = await col.findOne({
        username: sanitize(username)
    });

      // Return false if user is not found
      if (!user) {
        return false;
    }

    // check that the password matches the stored hash
    const verify = await argon2.verify(user.password, password);
    if (verify) {
        return {
            username: user.username,
            _id: user._id
        }
    } else {
        return false;
    }
}