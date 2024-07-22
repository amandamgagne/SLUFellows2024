// main entry point into the server program

"use strict";

import express from "express";
import session from "express-session";
import mongoStore from "connect-mongo";

import todoRouter from "./routes/todo.mjs";

import { initDb, getClient } from "./models/db.mjs";

// connect to MongoDB and then spin up our server
initDb().then(() => {
    // create an application object
    const app = express();

    // create our session store
    const store = mongoStore.create({
        client: getClient(),
        dbName: "ToDoApp",
        touchAfter: 24 * 3600 // every 24 hours
    });

    // session settings
    const sess = {
        secret: "SLU CS332",
        cookie: {},
        store: store,
        resave: false,
        saveUninitialized: false
    };

    // tell app to use the session
    app.use(session(sess));

    // parse the body of request object as json
    app.use(express.json());

    // Middleware to set security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY'); // Or 'SAMEORIGIN' or 'ALLOW-FROM uri'
        next();
    });

    /*// serve static files from the public folder in this package
    // if no other "middleware" function (request handler) fires,
    // look for the page requested in the public folder
    app.use(express.static("pub"));*/

    // serve static files from the public folder in this package
    // if no other "middleware" function (request handler) fires,
    // look for the page requested in the public folder
    app.use(express.static("pub", {
        setHeaders: (res, path, stat) => {
            if (path.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html');
            } else if (path.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            } else if (path.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            } else if (path.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
            }
            // Add other content types as needed
        }
    }));

    // Add the /logout route
    app.get("/logout", (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Failed to logout');
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.send('Logged out');
        });
    });

    app.use("/api", todoRouter);

    // TODO
    // add all of our request handlers to this app
    // object
    app.get("/", (req, resp) => {
        // req object contains all information about incoming request
        // resp object allows us to modify the response object before
        // express sends it back to the user

        // json method will send json data back to the client
        resp.json({
            "beep": "boop",
            "hello": "world"
        });
    });

 
    // TODO GET /add add an x and a y request value and return the result 
    // as { result: x + y }
    app.get("/add", (req, resp) => {
        // req object contains all information about incoming request
        // resp object allows us to modify the response object before
        // express sends it back to the user
        
        const x = parseInt(req.query.x);
        const y = parseInt(req.query.y);

        // json method will send json data back to the client
        resp.json({
            result: x + y
        });
    });

    app.get("/ed", (req, resp) => {
        resp.json({
            "ed": "harcourt"
        });
    });

    app.get("/randrange", (req, resp) => {
        resp.json({
            "start": 0,
            "end": "TBD"
        });
    });

    app.get("/random", (req, resp) => {
        resp.json({
            
        });
    });

    // turn the app into a server
    const server = app.listen(3001);
    server.on("listening", () => {
        console.log(`Listening on ${server.address().port}.`)
    });
});
