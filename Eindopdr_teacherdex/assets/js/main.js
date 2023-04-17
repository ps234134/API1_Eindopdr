// * Main api handler
function fetch_api(i) {
  const api = `https://pokeapi.co/api/v2/pokemon/${i}/`;
  const promise = fetch(api);
  return promise.then((response) => {
    return response.json();
  });
}

// * Generate pokemon cards funtion
function generate_pokemons() {
  for (let i = 1; i < 10; i++) {
    let pokemon_card = fetch_api(i);
    pokemon_card.then((data) => {
      const card = document.createElement("div");
      card.classList.add("card");
      const img = document.createElement("img");
      img.src = data.sprites.other.dream_world.front_default;
      const pokemon_name = document.createElement("p");
      pokemon_name.innerText = data.name;
      card.appendChild(img);
      card.appendChild(pokemon_name);
      const main = document.querySelector(".main");
      main.appendChild(card);
    });
  }
}

// * Dark mode
function enable_dark_mode() {
  document.body.classList.toggle("dark");
}

// * Close search results
function remove() {
  const search_results = document.querySelector(".search_result");
  search_results.classList.add("none");
}

//*  Generate pokemon cards
generate_pokemons();

// * Add teachers

document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.getElementById("add");
  const formContainer = document.querySelector(".form-popup");
  const closeButton = document.querySelector(".form-popup .close");

  addButton.addEventListener("click", () => {
    formContainer.style.display = "block";
  });

 

  closeButton.addEventListener("click", () => {
    formContainer.style.display = "none";
  });

  const addTeacherForm = document.querySelector(".form-container");

  addTeacherForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const naam = addTeacherForm.querySelector('input[name="naam"]').value;
    const achternaam = addTeacherForm.querySelector(
      'input[name="achternaam"]'
    ).value;
    const afkorting = addTeacherForm.querySelector(
      'input[name="afkorting"]'
    ).value;
    const email = addTeacherForm.querySelector('input[name="email"]').value;
    const klas = addTeacherForm.querySelector('select[name="klas"]').value;
    const vak = addTeacherForm.querySelector('select[name="vak"]').value;

    // TODO: Add teacher to database or display it on the page
    console.log(
      `Naam: ${naam}, Achternaam: ${achternaam}, Afkorting: ${afkorting}, Email: ${email}, Klas: ${klas}, Vak: ${vak}`
    );

    addTeacherForm.reset();
    formContainer.style.display = "none";
  });
});

// * popup modal


