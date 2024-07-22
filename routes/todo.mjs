"use strict";

// routes for handling todo items

import express from "express";

import { generateTodo, insertTodo, removeTodo, getTodo, getAllTodos } from "../models/todo.mjs";
import { createUser, validateUser } from "../models/user.mjs";

function isSignedIn(req) {
    return req.session._id !== undefined;
}

// create a Router object (sub-component of our http server)
const router = express.Router();

// register handler
router.post("/register", async (req, resp) => {
    // check that the request has a username and password
    const keys = ["username", "password"];
    if (!keys.every((e) => req.body.hasOwnProperty(e))) {
        // ERROR this is a malformed registration request
        resp.status(403);
        resp.json({
            "message": "registration must have a username and password field"
        });
        return;
    }

    // create the user
    const user = await createUser(req.body.username, req.body.password);

    // store username and _id as part of session
    req.session.username = user.username;
    req.session._id = user._id;

    // send back a confirmation message
    resp.json({
        "message": "registration successful",
        "username": user.username
    });

});

router.post("/login", async (req, resp) => {
    if (req.session._id) {
        // already logged in
        resp.json({
            "message": "already logged in",
            "username": req.session.username
        });
        return;
    }
    
    // check that the request has a username and password
    const keys = ["username", "password"];
    if (!keys.every((e) => req.body.hasOwnProperty(e))) {
        // ERROR this is a malformed registration request
        resp.status(403);
        resp.json({
            "message": "registration must have a username and password field"
        });
        return;
    }

    // validate the user
    const valid = await validateUser(req.body.username, req.body.password);
    if (!valid) {
        resp.status(403);
        resp.json({
            "message": "invalid username or password"
        });
        return;
    }

    // store username and _id as part of session
    req.session.username = req.body.username;
    req.session._id = valid._id;

    // send back a confirmation message
    resp.json({
        "message": "login successful",
        "username": req.body.username
    });
});

/*router.get("/logout", (req, resp) => {
    if (!isSignedIn(req)) {
        resp.status(401);
        resp.json({
            "message": "must be signed in to logout"
        });
        return;
    }
    // clear the session
    // deletes any of the sessions variables and
    // unlinks the UNIQUE session id from the session data
    req.session.destroy();

    // send back a confirmation message
    resp.json({
        "message": "logout successful"
    });
});*/
router.get("/logout", (req, resp) => {
    if (!isSignedIn(req)) {
        resp.status(401);
        resp.json({
            "message": "must be signed in to logout"
        });
        return;
    }
    // clear the session
    req.session.destroy(err => {
        if (err) {
            return resp.status(500).json({ message: 'Logout failed' });
        }
        // send back a confirmation message
        resp.json({
            "message": "logout successful"
        });
    });
});

router.get("/random.json", (req, resp) => {
    // get the number from the query parameter
    // or if that's not provided, default to 10
    const number = req.query.num || 10;

    // generate a bunch of todos
    const todos = Array.from({length: number}).map(generateTodo);

    resp.json(todos); 
});

router.get("/todos.json", async (req, resp) => {
    if (!isSignedIn(req)) {
        resp.status(401);
        resp.json({
            "message": "must be signed in to view todos"
        });
        return;
    }
    resp.json(await getAllTodos());
});

router.post("/add", async (req, resp) => {
    if (!isSignedIn(req)) {
        resp.status(401);
        resp.json({
            "message": "must be signed in to add todos"
        });
        return;
    };
    // handle a POST request to send data to the server to add a TODO item
    // check that the todo item sent in the request has the correct fields
    if (!["due", "description", "priority"].every((e) => req.body.hasOwnProperty(e))) {
        // ERROR this is a malformed todo item
        resp.status(403);
        resp.json({
            "message": "todo must have a due, description, and priority field"
        });
        return;
    };

    // validate due date
    const due = new Date(req.body.due);
    if (isNaN(due.valueOf())) {
        resp.status(403);
        resp.json({
            "message": "due date is not valid"
        });
        return;
    };

    // validate priority
    const priority = req.body.priority;
    if (["normal", "high", "low"].indexOf(priority) === -1) {
        resp.status(403);
        resp.json({
            "message": "priority is not valid"
        });
        return;
    };

    // valid todo data at this point
    resp.json(await insertTodo({
        description: req.body.description,
        due: due,
        priority: priority
    }));
});

router.delete("/:id", async (req, resp) => {
    if (!isSignedIn(req)) {
        resp.status(401);
        resp.json({
            "message": "must be signed in to delete todos"
        });
        return;
    };
    // :id is an express parameter
    // req.params.id
    try {
        await removeTodo(req.params.id);
        resp.status(204); // no content response
        resp.end();
    } catch (e) {
        resp.status(403);
        resp.json({
            message: "the delete failed",
            cause: e.stack
        });
    }
});

router.get("/:id", async (req, resp) => {
    if (!isSignedIn(req)) {
        resp.status(401);
        resp.json({
            "message": "must be signed in to view todos"
        });
        return;
    };
    try {
        resp.json(await getTodo(req.params.id));
    } catch (e) {
        resp.status(403);
        resp.json({
            message: "the get failed",
            cause: e.stack
        });
    }
});

// set the default exported object to the router variable
export default router;