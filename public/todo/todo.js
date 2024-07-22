"use strict";

// store all the todo items
const todos = {};
let todoCounter = 0;

// code that gets run when the browser loads the TODO app

/**
 * Given a todo item, insert it into the todo list. 
 * If this is the first item, we will also create the skeleton for the todo list table
 * @param {Todo item} item
 * @param {boolean} store: put this todo in local storage or not
 */
function insertTodo(item, store=true) {
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
    tableBody.appendChild(row);

    const key = todoCounter++;
    if (store) {
        // add the Todo to the global todo list
        todos[key] = item;
    }

    // update our local storage for the updated global todo object
    window.localStorage.setItem("todos", JSON.stringify(todos));

    row.querySelector(".remove").addEventListener("click", (evt) => {
        // this function will get called when the X button is clicked
        // prevent the default click behavior from happening
        evt.preventDefault();
        // remove the row from the DOM
        tableBody.removeChild(row);

        if (store){
        // remove the todo from the global object
        delete todos [key]; // closure leads to access to the key outside function

        // update local storage
        window.localStorage.setItem("todos", JSON.stringify(todos));
        }

    })

}

// put the main program (what runs when the page loads) into an event
// handler for the load event on the window
window.addEventListener("load", () => {

    // fetch the global todo items
    fetch("global_todos.json").then((r) => r.json()).then((data) => {
        // access all the todo items
        Object.values(data).forEach((todo) => {
            todo.due = new Date(todo.due);
            insertTodo(todo, false);
        })
    });

    // load all todo items from local storage
    const oldTodoString = window.localStorage.getItem("todos");
    let oldTodos;
    if (!oldTodoString) {
        // this key doesn't exist in localstorage yet (first run of app)
        oldTodos = {};
    }
    else {
        oldTodos = JSON.parse(oldTodoString);
    }

    // loop over all of the objects in oldTodos and add them
    Object.values(oldTodos).forEach((todo) => {
        insertTodo({
            description: todo.description, 
            due: new Date(todo.due), 
            priority: todo.priority
        });
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
});

