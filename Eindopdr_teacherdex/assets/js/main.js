// Dark mode
function enable_dark_mode() {
  document.body.classList.toggle("dark");
}

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

  const editBtns = document.getElementsByClassName("popup-edit");
  const removeBtns = document.getElementsByClassName("popup-remove");
  const addBtn = document.getElementById("add");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

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

document.getElementsByClassName("close")[0].addEventListener("click", function() {
  document.getElementById("classLogin").style.display = "none";
});

document.getElementsByClassName("closeRegister")[0].addEventListener("click", function() {
  document.getElementById("classRegister").style.display = "none";
});

// Store the access token in a variable after successful login
let accessToken = "";

// Function to handle user login and set the access token
function handleLogin(data) {
  accessToken = data._bearer; // Set the access token value from the response data
  updateButtonVisibility(); // Call the function to update button visibility
  document.getElementById("classLogin").style.display = "none"; // Hide the login form
  document.getElementById("classRegister").style.display = "none"; // Hide the registration form
}

// Event listeners
document.getElementById("loginForm").addEventListener("submit", login);
document.getElementById("registerForm").addEventListener("submit", register);
document.getElementById("logoutForm").addEventListener("submit", logout);
document.getElementById("loginBtn").addEventListener("click", showLoginForm);
document.getElementById("registerBtn").addEventListener("click", showRegisterForm);
document.getElementById("logoutBtn").addEventListener("click", logout);

// Functions
async function login(event) {
  event.preventDefault();
  // Retrieve form data
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    // Send login request to the server
    const response = await fetch("http://127.0.0.1:8081/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, wachtwoord: password }),
    });

    if (response.ok) {
      // Login successful
      alert("Login successful");
      const data = await response.json();
      // Store the access token
      handleLogin(data);
    } else {
      // Login failed
      alert("Login failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during login. Please try again.");
  }
}

async function register(event) {
  event.preventDefault();
  // Retrieve form data
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    // Send register request to the server
    const response = await fetch("http://127.0.0.1:8081/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ naam: name, email, wachtwoord: password }),
    });

    if (response.ok) {
      // Registration successful
      alert("Registration successful");
      document.getElementById("classRegister").style.display = "none"; // Hide the registration form
    } else {
      // Registration failed
      alert("Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during registration. Please try again.");
  }
}

async function logout(event) {
  event.preventDefault();
  try {
    // Verify the access token value
    console.log(accessToken);
    // Send logout request to the server
    const response = await fetch("http://127.0.0.1:8081/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Include the access token in the Authorization header
      },
    });

    if (response.ok) {
      // Logout successful
      alert("Logout successful");
      // Reset the access token
      accessToken = "";
      // Call the function to update button visibility
      updateButtonVisibility();
    } else {
      // Logout failed
      alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during logout. Please try again.");
  }
}

function showLoginForm() {
  // Show login form, hide register form
  document.getElementById("classLogin").style.display = "block";
  document.getElementById("classRegister").style.display = "none";
  document.getElementById("classLogout").style.display = "none";
}

function showRegisterForm() {
  // Show register form, hide login form
  document.getElementById("classLogin").style.display = "none";
  document.getElementById("classRegister").style.display = "block";
  document.getElementById("classLogout").style.display = "none";
}

// Function to update button visibility based on login status
function updateButtonVisibility() {
  const editBtns = document.getElementsByClassName("popup-edit");
  const removeBtns = document.getElementsByClassName("popup-remove");
  const addBtn = document.getElementById("add");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (accessToken) {
    // User is logged in
    for (let i = 0; i < editBtns.length; i++) {
      editBtns[i].style.display = "block";
    }
    for (let i = 0; i < removeBtns.length; i++) {
      removeBtns[i].style.display = "block";
    }
    addBtn.style.display = "block";
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "block";
  } else {
    // User is logged out
    for (let i = 0; i < editBtns.length; i++) {
      editBtns[i].style.display = "none";
    }
    for (let i = 0; i < removeBtns.length; i++) {
      removeBtns[i].style.display = "none";
    }
    addBtn.style.display = "none";
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    logoutBtn.style.display = "none";
  }
}

