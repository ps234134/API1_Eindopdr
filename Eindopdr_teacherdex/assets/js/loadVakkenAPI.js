// Main api handler
const api = {
    docenten: "http://127.0.0.1:8081/api/docenten",
    klassen: "http://127.0.0.1:8081/api/klassen",
    vakken: "http://127.0.0.1:8081/api/vakken",
  };
  
  // loads vakken
const vakkenList = document.getElementById('vakkenList');

const getVakken = async () => {
  try {
    const response = await fetch(api.vakken);
    const data = await response.json();
   
    return data;
  } catch (error) {
    console.error(`Error fetching vakken: ${error}`);
    return null;
  }
};

const loadVakken = async () => {
  const vakken = await getVakken();
  console.log(vakken);
  if (vakken) {
    vakken.forEach((vak) => {
      console.log(vak);
      const li = document.createElement('li');
      li.textContent = vak.naam;
      console.log(li);
      console.log(vakkenList);
      vakkenList.appendChild(li);
  
    });
  }
};