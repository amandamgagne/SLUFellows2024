"use strict";

function validate(event) {
  const form = event.currentTarget;
  const password = form.password.value;
  const password2 = form.password2.value;

  if (password !== password2) {
    form.password2.setCustomValidity("Passwords must match");
  } else {
    form.password2.setCustomValidity("");
  }

  if (!form.checkValidity()) {
    // there is an error to deal with
    // stop the propagation of the click event so no
    // other click handlers are processed
    event.stopPropagation();
    form.classList.add('was-validated');
    return;
  }
}

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const username = form.username.value;
  const password = form.password.value;
  const password2 = form.password2.value;

  


  const response = await fetch("/api/register", {
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
  document.querySelector("#sign-in-form").addEventListener("change", validate);
});