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
"use strict";

const api = "http://127.0.0.1:8081/api/docenten";


const fetchDocenten = async () => {
  const response = await fetch(api);
  const data = await response.json();
  return data;
};

const generateCards = async () => {
    const docenten = await fetchDocenten();
    const container = document.querySelector(".main");
    docenten.forEach((docent) => {
      const card = document.createElement("div");
      card.classList.add("card");
  
      const img = document.createElement("img");
      img.src = docent.img;
      img.addEventListener("click", () => {
        // Show the popup/modal
        popup.style.display = "block";
  
        // Fill the popup/modal with the docent details
        popupImg.src = docent.img;
        popupNaam.innerText = docent.naam;
        popupAchternaam.innerText = docent.achternaam;
        popupAfkorting.innerText = docent.afkorting;
        popupEmail.innerText = docent.email;
        popupKlas.innerText = docent.klas;
        popupVak.innerText = docent.vak;
      });
  
      const naam = document.createElement("p");
      naam.innerText = docent.naam;
  
      const achternaam = document.createElement("p");
      achternaam.innerText = docent.achternaam;
  
      card.appendChild(img);
      card.appendChild(naam);
      card.appendChild(achternaam);
  
      // Create the popup/modal and append it to the card
      const popup = document.createElement("div");
      popup.classList.add("popup");
  
      const popupClose = document.createElement("span");
      popupClose.classList.add("popup-close");
      popupClose.innerHTML = "&times;";
      popupClose.addEventListener("click", () => {
        // Hide the popup/modal
        popup.style.display = "none";
      });
  
      const popupImg = document.createElement("img");
      const popupNaam = document.createElement("p");
      const popupAchternaam = document.createElement("p");
      const popupAfkorting = document.createElement("p");
      const popupEmail = document.createElement("p");
      const popupKlas = document.createElement("p");
      const popupVak = document.createElement("p");
  
      popup.appendChild(popupClose);
      popup.appendChild(popupImg);
      popup.appendChild(popupNaam);
      popup.appendChild(popupAchternaam);
      popup.appendChild(popupAfkorting);
      popup.appendChild(popupEmail);
      popup.appendChild(popupKlas);
      popup.appendChild(popupVak);
  
      card.appendChild(popup);
  
      container.appendChild(card);
    });
  };
generateCards();


