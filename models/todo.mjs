"use strict";

import { LoremIpsum } from "lorem-ipsum";

import { getDb } from "./db.mjs";

import { ObjectId } from "mongodb";

// the todo "model" will represent todo items in our
// application and provide different functions for working with
// and manipulating todo items

function randrange(start, end) {
    return Math.floor(start) + Math.floor(Math.random() * (end-start));
}

function getRandomDate() {
    return new Date(new Date().valueOf() + randrange(-1e9, 1e9));
}

function getRandomPriority() {
    const priorities = ["low", "normal", "high"];
    return priorities[randrange(0, priorities.length)];
}

export function generateTodo() {
    const generator = new LoremIpsum();
    return {
        description: generator.generateSentences(1),
        priority: getRandomPriority,
        due: getRandomDate()
    }
}

export async function insertTodo(todo) {
    const col = getDb().collection("todo");

    // insert a document!
    const res = await col.insertOne(todo);
    // res object will contain an _id field with the unique ID of the
    // document we just inserted

    // returns the todo object with an _id field
    return {
        ...todo, // spread operator, expand the todo object's fields into this object
        _id: res.insertedId,
        url: `/api/${res.insertedId}`
    };
}

export async function removeTodo(id) {
    // delete the document
    const col = getDb().collection("todo");
    const result = await col.deleteOne({
        _id: new ObjectId(id) // turn id into an ObjectId
    });

    // check if a document was deleted
    if (result.deletedCount !== 1) {
        throw "No todo with this id";
    }

    return true;
}

export async function getTodo(id) {
    const col = getDb().collection("todo");
    const todo = await col.findOne({
        _id: new ObjectId(id)
    });

    if (todo)  {
        return {
            ...todo,
            url: `/api/${id}`
        };
    } else {
        throw "todo not found";
    }
}

export async function getAllTodos() {
    const col = getDb().collection("todo");
    const todos = await col.find({}).toArray();
    return todos.map(t => {
        return {
            ...t,
            url: `/api/${t._id}`
        };
    });
}
