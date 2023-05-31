"use strict";
// Main api handler
const api = {
  docenten: "http://127.0.0.1:8081/api/docenten",
  klassen: "http://127.0.0.1:8081/api/klassen",
  vakken: "http://127.0.0.1:8081/api/vakken",
};

const fetchKlas = async (id) => {
  try {
    const response = await fetch(`${api.klassen}/${id}`);
    const data = await response.json();
    return data.naam;
  } catch (error) {
    console.error(`Error fetching klas ${id}: ${error}`);
    return null;
  }
};

const fetchVak = async (id) => {
  try {
    const response = await fetch(`${api.vakken}/${id}`);
    const data = await response.json();
    return data.naam;
  } catch (error) {
    console.error(`Error fetching vak ${id}: ${error}`);
    return null;
  }
};

const fetchDocenten = async () => {
  try {
    const response = await fetch(api.docenten);
    const data = await response.json();

    const docenten = await Promise.all(
      data.map(async (docent) => {
        const klasNaam = await fetchKlas(docent.klasId);
        const vakNaam = await fetchVak(docent.vakId);
        return {
          ...docent,
          klasNaam,
          vakNaam,
        };
      })
    );

    return docenten;
  } catch (error) {
    console.error(`Error fetching docenten: ${error}`);
    return null;
  }
};

const generateCards = async () => {
  try {
    const docenten = await fetchDocenten();
    const container = document.querySelector(".main");

    docenten.forEach((docent) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const img = document.createElement("img");
      img.src = docent.img;
      img.addEventListener("click", () => {
        const popup = card.querySelector(".popup");
        popup.style.display = "block";

        const popupImg = card.querySelector(".popup-img");
        const popupNaam = card.querySelector(".popup-naam");
        const popupAchternaam = card.querySelector(".popup-achternaam");
        const popupAfkorting = card.querySelector(".popup-afkorting");
        const popupEmail = card.querySelector(".popup-email");
        const popupKlas = card.querySelector(".popup-klas");
        const popupVak = card.querySelector(".popup-vak");

        const popupRemove = card.querySelector(".popup-remove");
        const popupClose = card.querySelector(".popup-close");

        popupImg.src = docent.img;
        popupNaam.innerText = `Naam: ${docent.naam}`;
        popupAchternaam.innerText = `Achternaam: ${docent.achternaam}`;
        popupAfkorting.innerText = `Afkorting: ${docent.afkorting}`;
        popupEmail.innerText = `Email: ${docent.email}`;
        popupKlas.innerText = `Klas: ${docent.klasNaam}`;
        popupVak.innerText = `Vak: ${docent.vakNaam}`;

        popupRemove.addEventListener("click", async () => {
          try {
            const response = await fetch(`${api.docenten}/${docent._id}`, {
              method: "DELETE",
            });
            if (response.ok) {
              // Remove the card from the UI
              container.removeChild(card);
            } else {
              console.log("Failed to delete docent");
            }
          } catch (error) {
            console.log(error);
          }
        });
        popupClose.addEventListener("click", () => {
          popup.style.display = "none";
        });
      });

      const naam = document.createElement("p");
      naam.innerText = docent.naam;

      const achternaam = document.createElement("p");
      achternaam.innerText = docent.achternaam;

      card.appendChild(img);
      card.appendChild(naam);
      card.appendChild(achternaam);

      const popup = document.createElement("div");
      popup.classList.add("popup");

      const popupClose = document.createElement("div");
      popupClose.classList.add("popup-close");
      popupClose.innerText = "X";
      popupClose.addEventListener("click", () => {
        popup.style.display = "none";
      });

      popup.appendChild(popupClose);

      const popupImg = document.createElement("img");
      popupImg.classList.add("popup-img");
      popup.appendChild(popupImg);

      const popupNaam = document.createElement("p");
      popupNaam.classList.add("popup-naam");
      popup.appendChild(popupNaam);

      const popupAchternaam = document.createElement("p");
      popupAchternaam.classList.add("popup-achternaam");
      popup.appendChild(popupAchternaam);

      const popupAfkorting = document.createElement("p");
      popupAfkorting.classList.add("popup-afkorting");
      popup.appendChild(popupAfkorting);

      const popupEmail = document.createElement("p");
      popupEmail.classList.add("popup-email");
      popup.appendChild(popupEmail);

      const popupKlas = document.createElement("p");
      popupKlas.classList.add("popup-klas");
      popup.appendChild(popupKlas);

      const popupVak = document.createElement("p");
      popupVak.classList.add("popup-vak");
      popup.appendChild(popupVak);

      const closeBtnForm = document.querySelector(
        ".modal-form-popup .closeBtn"
      );
      const modalForm = document.querySelector(".modal-form-popup");
      const editButton = document.createElement("button");
      editButton.classList.add("popup-edit");
      editButton.innerText = "Edit";
      editButton.addEventListener("click", () => {
        const openModal = async (docentId) => {
          // Fetch docent data
          const response = await fetch(`${api.docenten}/${docentId}`);
          const docent = await response.json();

          // Fetch klas data for dropdown
          const klasResponse = await fetch(api.klassen);
          const klassen = await klasResponse.json();

          // Fetch vak data for dropdown
          const vakResponse = await fetch(api.vakken);
          const vakken = await vakResponse.json();

          // Set values in the form
          document.getElementById("naamModal").value = docent.naam;
          document.getElementById("achternaamModal").value = docent.achternaam;
          document.getElementById("afkortingModal").value = docent.afkorting;
          document.getElementById("emailModal").value = docent.email;
          document.getElementById("klasModal").innerHTML = klassen
            .map(
              (klas) =>
                `<option value="${klas.id}" ${
                  klas.id === docent.klasId ? "selected" : ""
                }>${klas.naam}</option>`
            )
            .join("");
          document.getElementById("vakModal").innerHTML = vakken
            .map(
              (vak) =>
                `<option value="${vak.id}" ${
                  vak.id === docent.vakId ? "selected" : ""
                }>${vak.naam}</option>`
            )
            .join("");
        };

        openModal(docent._id);
        modalForm.style.display = "block";
      });

      closeBtnForm.addEventListener("click", () => {
        modalForm.style.display = "none";
      });

      popup.appendChild(editButton);

      const removeButton = document.createElement("button");
      removeButton.classList.add("popup-remove");
      removeButton.innerText = "Remove";
      removeButton.addEventListener("click", async () => {
        try {
          const response = await fetch(`${api.docenten}/${docent._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${_bearer}`,
            },
          });
          if (response.ok) {
            // Remove the card from the UI
            container.removeChild(card);
          } else {
            console.log("Failed to delete docent");
          }
        } catch (error) {
          console.log(error);
        }
      });
      popup.appendChild(removeButton);

      card.appendChild(popup);
      container.appendChild(card);
    });
  } catch (error) {
    console.log(error);
  }
};

// login

  // // Add this JavaScript code to your existing main.js file or create a new one
  // document.getElementById("loginBtn").addEventListener("click", function() {
  //   document.getElementById("classLogin").style.display = "block";
  // });

  document.getElementsByClassName("close")[0].addEventListener("click", function() {
    document.getElementById("classLogin").style.display = "none";
  });

  // document.getElementById("loginForm").addEventListener("submit", function(event) {
  //   event.preventDefault();
  //   // Add your login form submission logic here
  // });

  // document.getElementById("registerBtn").addEventListener("click", function() {
  //   document.getElementById("classRegister").style.display = "block";
  // });


  document.getElementsByClassName("closeRegister")[0].addEventListener("click", function() {
    document.getElementById("classRegister").style.display = "none";
  });

  // document.getElementById("registerForm").addEventListener("submit", function(event) {
  //   event.preventDefault();
  //   // Add your login form submission logic here
  // });

 // Event listeners
 document.getElementById("loginForm").addEventListener("submit", login);
 document.getElementById("registerForm").addEventListener("submit", register);
 document.getElementById("logoutForm").addEventListener("submit", logout);
 document.getElementById("loginBtn").addEventListener("click", showLoginForm);
 document.getElementById("registerBtn").addEventListener("click", showRegisterForm);
 document.getElementById("logoutBtn").addEventListener("click", logout);
  // Functions
  function login(event) {
    event.preventDefault();
    // Retrieve form data
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Send login request to the server
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle login response
        if (data._bearer) {
          // Login successful
          // Hide login and register buttons, show logout button
          document.getElementById("classLogin").style.display = "none";
          document.getElementById("classRegister").style.display = "none";
          document.getElementById("classLogout").style.display = "block";
        } else {
          // Login failed
          alert("Login failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during login. Please try again.");
      });
  }

   

  function register(event) {
    event.preventDefault();
    // Retrieve form data
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    // Send register request to the server
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle register response
        if (data.success) {
          // Registration successful
          // Hide login and register buttons, show logout button
          document.getElementById("classLogin").style.display = "none";
          document.getElementById("classRegister").style.display = "none";
          document.getElementById("classLogout").style.display = "block";
        } else {
          // Registration failed
          alert("Registration failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during registration. Please try again.");
      });
  }

  function logout(event) {
    event.preventDefault();
    // Send logout request to the server
    fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle logout response
        if (data.success) {
          // Logout successful
          // Hide logout button, show login and register buttons
          document.getElementById("classLogout").style.display = "none";
          document.getElementById("classLogin").style.display = "block";
          document.getElementById("classRegister").style.display = "block";
        } else {
          // Logout failed
          alert("Logout failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during logout. Please try again.");
      });
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