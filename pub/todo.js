"use strict";

// store all the todo items
const todos = {};
let todoCounter = 0;

// code that gets run when the browser loads the TODO app

/**
 * Given a todo item, insert it into the todo list. 
 * If this is the first item, we will also create the skeleton for the todo list table
 * @param {Todo item} item
 */
function insertTodoIntoTable(item) {
    // grab the root of the app
    const todo = document.querySelector("#todo");

    // check if the table exists
    if(!todo.querySelector("#todo-table")) {
        // table does not exist
        // create it!
        const parser = new DOMParser(); // creating an object in JS, can read text or string
        const table = parser.parseFromString(`
            <table id = "todo-table" class = "table">
                <thead>
                    <tr>
                        <th scope = "col">Description</th>
                        <th scope = "col">Due Date</th>
                        <th scope = "col">Priority</th>
                        <th scope = "col"></th>
                    </tr>
                </thead>
                <tbody id = "todo-body">
                </tbody>
            </table>
        `, "text/html");
        // insert this snippet into the DOM
        todo.appendChild(table.body.firstElementChild);
    } // if-todo-table

    // add the todo to the table
    const tableBody = todo.querySelector("#todo-body");
    // an alternate way of creating DOM nodes and inserting them
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.description}</td>
        <td class = "todo-date">${item.due}</td>
        <td>${item.priority}</td>
        <td><a href="" class = "remove"><i class="bi bi-x-lg"></i></a></td>
    `;
    // set the id on this row
    row.id = `id${item._id}`;
    tableBody.appendChild(row);

    // update our local storage for the updated global todo object
    window.localStorage.setItem("todos", JSON.stringify(todos));

    row.querySelector(".remove").addEventListener("click", async (evt) => {
        // this function will get called when the X button is clicked
        // prevent the default click behavior from happening
        evt.preventDefault();

        // remove from backend
        const response = await fetch(item.url, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Failed to delete todo");
            return;
        }

        // remove the row from the DOM
        tableBody.removeChild(row);
    });

}

async function insertTodo(todo) {
    const response = await fetch("/api/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(todo)
    });

    if (!response.ok) {
        alert("The insert failed");
        return;
    }

    const data = await response.json();
    // insert the todo with the _id and url fields
    insertTodoIntoTable(data);
}

// put the main program (what runs when the page loads) into an event
// handler for the load event on the window
window.addEventListener("load", () => {

    // fetch the global todo items
    fetch("/api/todos.json").then((r) => {
        if (!r.ok) {
            // we're probably not signed in
            // redirect browser to the login page
            window.location.href = "/login.html";
        }
        return r.json();
    }).then((data) => {
        // access all the todo items
        Object.values(data).forEach((todo) => {
            todo.due = new Date(todo.due);
            insertTodoIntoTable(todo);
        })
    });

    // handler when the button is clicked
    document.querySelector("#add").addEventListener("click", (evt) => {
        evt.preventDefault();

        const form = document.querySelector("form");

        const desc = form.querySelector("#description");
        const due = form.querySelector("#due");
        const priority = form.querySelector("#priority");

        // check the validity of the date
        if (isNaN(new Date(due.value).valueOf())){
            due.setCustomValidity("Must be a valid date");
        } else {
            // clear validation errors
            due.setCustomValidity("");
        }

        if (!form.checkValidity()) {
            // there is an error to deal with
            // stop the propagation of the click event so no
            // other click handlers are processed
            evt.stopPropagation();

            form.classList.add('was-validated');
            return;
        }

        // YAY! The form is valid :-)
        const todo = {
            description: desc.value,
            due: new Date(due.value),
            priority: priority.value
        };

        insertTodo(todo);

        // clear out the form fields
        desc.value = "";
        due.value = "";
        priority.value = "normal";

        // clear form validation
        form.classList.remove("was-validated");
    });

    document.querySelector("#logout").addEventListener("click", async (evt) => {
        evt.preventDefault();
        const response = await fetch("/logout", {
            method: "GET"
        });
        if (response.ok) {
            window.location.href = "/login.html"; // Redirect to login page
        } else {
            alert("Logout failed");
        }
    });
    

    // create a handler to update the table every second
    setInterval(() => {
        document.querySelectorAll(".todo-date").forEach((item) => {
            const date = new Date(item.textContent);
            const curr = new Date();
            if (date < curr) {
                item.parentElement.classList.add("table-danger");
            }
        });
    }, 1000);

    // check for new/deleted todos every 10s
    setInterval(async () => {
        const response = await fetch("/api/todos.json");
        if (!response.ok) {
            alert("You have been logged out");
            window.location.href = "/login.html";
        }

        const data = await response.json();
        // cross-check this data with the data in the table
        // map the id's in data to the id's of the rows
        const ids = data.map((todo) => `id${todos._id}`);
        const tableBody = document.querySelector("#todo-body");
        // get all of the table body's rows
        tableBody.querySelectorAll("tr").forEach((row) => {
            // if the row is not found in the ids array
            // it was deleted on the server, so remove this row
            if (!ids.includes(row.id)) {
                tableBody.removeChild(row);
            }
        });

        data.forEach((todo) => {
            // if the table does not have a row for this id
            // insert it
            if (!tableBody.querySelector(`#id${todo._id}`)) {
                insertTodoIntoTable(todo);
            }
        });
    }, 10000);
});
