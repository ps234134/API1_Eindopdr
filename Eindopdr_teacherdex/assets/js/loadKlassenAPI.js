// Main api handler
const api = {
    docenten: "http://127.0.0.1:8081/api/docenten",
    klassen: "http://127.0.0.1:8081/api/klassen",
    vakken: "http://127.0.0.1:8081/api/vakken",
  };
  
  // loads vakken
const vakkenList = document.getElementById('klassenList');

const getKlassen = async () => {
  try {
    const response = await fetch(api.klassen);
    const data = await response.json();
   
    return data;
  } catch (error) {
    console.error(`Error fetching klassen: ${error}`);
    return null;
  }
};

const loadKlassen = async () => {
  const klassen = await getKlassen();
  console.log(klassen);
  if (klassen) {
    klassen.forEach((klas) => {
      console.log(klas);
      const li = document.createElement('li');
      li.textContent = klas.naam;
      console.log(li);
      console.log(vakkenList);
      vakkenList.appendChild(li);
  
    });
  }
};