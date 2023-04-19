"use strict"

// Main api handler
const api = {klassen: "http://127.0.0.1:8081/api/klassen",
            vakken: "http://127.0.0.1:8081/api/vakken",}

fetch(api.klassen)
.then(response => response.json())
.then(data => {
  // Display the data in the div element
  const klassenDiv = document.querySelector('.klassen')
  klassenDiv.innerHTML = data.map(klas => klas.naam).join('<br>')
})
.catch(error => console.error(error))


fetch(api.vakken)
.then(response => response.json())
.then(data => {
  // Display the data in the div element
  const vakkenDiv = document.querySelector('.vakken')
  vakkenDiv.innerHTML = data.map(vak => vak.naam).join('<br>')
})
.catch(error => console.error(error))