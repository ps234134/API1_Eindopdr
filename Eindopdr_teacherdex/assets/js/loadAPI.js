// "use strict"
// const apiBasis = "http://127.0.0.1:8081/api/"
// const apiDocenten = apiBasis + "docenten/"
// const apiFuncties = apiBasis + "functies/"

// let functies = []
// let json = null

// const laadFuncties = async () => {
//     const response = await axios.get(apiFuncties)
//     const json = await response.data
//     let nieuweInhoud = ''
//     json.map(el => {
//         functies[el._id] = el.naam
//         nieuweInhoud += `<option value="${el._id}">${el.naam}</option>`
//     })
//     document.querySelector("#functie").innerHTML = nieuweInhoud
//     console.log(functies)
// }

// //		const laadWerknemers = async () => {
// //			console.log('Laad gegevens')
// //            const response = await axios.get(apiWerknemers)
// //            json = await response.data
// //		}

// const laadFunctieWerknemers = async () => {
//     const functie  = document.querySelector("#functie").value
//     console.log('selecteer Functie ', functie)
//     const apiFunctiesWerknemers = `${apiFuncties}${functie}/werknemers?sort=naam`
//     const response = await axios.get(apiFunctiesWerknemers)
//     json = await response.data
//     toon()
// }

// const toon = () => {
//     let tabelInhoud = ''
//     json.map(el => tabelInhoud += `<tr><td>${el.naam}</td><td>${el.telefoon}</td><td>${el.email}</td>
//                         <td>${functies[el.functie_id]}</td><td onclick="verwijder('${el._id}')"> x </td></tr>`)
//     document.querySelector("#tabelInhoud").innerHTML = tabelInhoud
// }

// const laad = async () => {
//     await laadFuncties()
//     await laadFunctieWerknemers()
//     toon()
// }

// const voegToe = async () => {
//     const naam     = document.querySelector("#naam").value
//     const telefoon = document.querySelector("#telefoon").value
//     const email    = document.querySelector("#email").value
//     const functie  = document.querySelector("#functie").value
//     const jsonstring = {"naam":naam, "telefoon":telefoon, "email":email, "functie_id":functie}
//     console.log("voeg toe: ",jsonstring)
//     const respons = await axios.post(apiWerknemers, jsonstring, {headers: {'Content-Type': 'application/json'}})
//     console.log('status code', respons.status)
//     document.querySelector("#naam").value = ''
//     document.querySelector("#telefoon").value = ''
//     document.querySelector("#email").value = ''
//     await laad()
// }

// const verwijder = async (id) => {
//     console.log("verwijder: ",id)
//     const respons = await axios.delete(apiWerknemers+id)
//     console.log('status code', respons.status)
//     await laad()
// }

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
        const popupEdit = card.querySelector(".popup-edit");
        const popupRemove = card.querySelector(".popup-remove");
        const popupClose = card.querySelector(".popup-close");

        popupImg.src = docent.img;
        popupNaam.innerText = `Naam: ${docent.naam}`;
        popupAchternaam.innerText = `Achternaam: ${docent.achternaam}`;
        popupAfkorting.innerText = `Afkorting: ${docent.afkorting}`;
        popupEmail.innerText = `Email: ${docent.email}`;
        popupKlas.innerText = `Klas: ${docent.klasNaam}`;
        popupVak.innerText = `Vak: ${docent.vakNaam}`;
        popupEdit.addEventListener("click", () => {
          // Redirect to edit page with the docent ID as a query parameter
          window.location.href = `edit.html?id=${docent._id}`;
        });
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

      const editButton = document.createElement("button");
      editButton.classList.add("popup-edit");
      editButton.innerText = "Edit";
      editButton.addEventListener("click", () => {
        const naam = prompt("Enter the new name:");
        const achternaam = prompt("Enter the new last name:");
        const email = prompt("Enter the new email:");
        const klasNaam = prompt("Enter the new class:");
        const vakNaam = prompt("Enter the new course:");

        const data = {
          naam,
          achternaam,
          email,
          klasNaam,
          vakNaam,
        };

        fetch(`/api/docenten/${docent._id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.text())
          .then((data) => {
            console.log(data);
            location.reload();
          })
          .catch((error) => console.log(error));
      });
      popup.appendChild(editButton);

      const removeButton = document.createElement("button");
      removeButton.classList.add("popup-remove");
      removeButton.innerText = "Remove";
      removeButton.addEventListener("click", () => {
        fetch(`/api/docenten/${docent._id}`, {
          method: "DELETE",
        })
          .then((res) => res.text())
          .then((data) => {
            console.log(data);
            location.reload();
          })
          .catch((error) => console.log(error));
      });
      popup.appendChild(removeButton);

      card.appendChild(popup);
      container.appendChild(card);
    });
  } catch (error) {
    console.log(error);
  }
};

