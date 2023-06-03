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
    console.log("Response status:", response.status); // Check the response status
    const data = await response.json();
    console.log("Fetched docenten:", data);
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
              headers: {
                Authorization: `Bearer ${token}`,
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
      editButton.id= "popup-edit";
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
      removeButton.id = "popup-remove";
      removeButton.innerText = "Remove";
      

      removeButton.addEventListener("click", async () => {
        try {
          const response = await fetch(`${api.docenten}/${docent._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
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

