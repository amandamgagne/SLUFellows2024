"use strict";

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const username = form.username.value;
  const password = form.password.value;
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });

  if (response.ok) {
    const data = await response.json();
    // redirect to the home page
    window.location.href = "/";
  } else {
    const err = await response.json();
    alert(err.message);
  }

}

window.addEventListener("load", function() {
  document.querySelector("#sign-in-form").addEventListener("submit", login);
});