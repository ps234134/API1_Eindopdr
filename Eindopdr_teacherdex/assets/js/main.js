
// * Dark mode
function enable_dark_mode() {
  document.body.classList.toggle("dark");
}

// * Add teachers

const klassenApi = "http://127.0.0.1:8081/api/klassen";
const vakkenApi = "http://127.0.0.1:8081/api/vakken";
const docentenApi = "http://127.0.0.1:8081/api/docenten";

const addBtn = document.getElementById("add");
const form = document.querySelector(".form-popup");
const closeBtn = document.querySelector(".form-popup .close");
const klasSelect = document.getElementById("klas");
const vakSelect = document.getElementById("vak");


// Load all classes
fetch(klassenApi)
  .then((response) => response.json())
  .then((data) => {
    data.forEach((klas) => {
      const option = document.createElement("option");
      option.value = klas._id; // set the value to the _id of the class
      option.textContent = klas.naam;
      klasSelect.appendChild(option);
    });
  });

// Load all subjects
fetch(vakkenApi)
  .then((response) => response.json())
  .then((data) => {
    data.forEach((vak) => {
      const option = document.createElement("option");
      option.value = vak._id; // set the value to the _id of the subject
      option.textContent = vak.naam;
      vakSelect.appendChild(option);
    });
  });

// Add teacher form
addBtn.addEventListener("click", () => {
  form.style.display = "block";
});

// Close form
closeBtn.addEventListener("click", () => {
  form.style.display = "none";
});

// Submit form
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const naam = document.querySelector('input[name="naam"]').value;
  const achternaam = document.querySelector('input[name="achternaam"]').value;
  const afkorting = document.querySelector('input[name="afkorting"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const klasId = klasSelect.value;
  const vakId = vakSelect.value;

  const teacher = {
    naam,
    achternaam,
    afkorting,
    email,
    klasId, // include klasId in teacher object
    vakId,
  };

  fetch(docentenApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teacher),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Teacher added successfully");
        form.style.display = "none";
        location.reload();
      } else {
        console.error("Error:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

// login

// Add this JavaScript code to your existing main.js file or create a new one
document.getElementById("loginBtn").addEventListener("click", function() {
  document.getElementById("classLogin").style.display = "block";
});

document.getElementsByClassName("close")[0].addEventListener("click", function() {
  document.getElementById("classLogin").style.display = "none";
});

document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  // Add your login form submission logic here
});

document.getElementById("registerBtn").addEventListener("click", function() {
  document.getElementById("classRegister").style.display = "block";
});


document.getElementsByClassName("closeRegister")[0].addEventListener("click", function() {
  document.getElementById("classRegister").style.display = "none";
});

document.getElementById("registerForm").addEventListener("submit", function(event) {
  event.preventDefault();
  // Add your login form submission logic here
});