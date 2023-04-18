// Supertest is a javascript library for testing http request
// npx jest to run the test ;)
const request = require('supertest');
const app = require('../apiTeacherdex');



describe('POST /api/docenten', () => {
  let createdDocentId;

  test('responds with JSON and creates a new docent', async () => {
    // Create a new docent without an _id
    const newDocent = {
      naam: 'Testy',
      achternaam: 'Testman',
      afkorting: 'TETE',
      email: 'te.Testman@summacollege.nl',
      img: 'https://example.com/testy.jpg'
    };

    const response = await request(app).post('/api/docenten').send(newDocent);

    expect(response.status).toBe(201);
    expect(response.type).toBe('text/html');

    createdDocentId = response.body._id;

    // GET request to verify the newly created docent
    const getResponse = await request(app).get(`/api/docenten/${createdDocentId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.type).toBe('application/json');
    expect(getResponse.body.naam).toBe(newDocent.naam);
    expect(getResponse.body.achternaam).toBe(newDocent.achternaam);
    expect(getResponse.body.afkorting).toBe(newDocent.afkorting);
    expect(getResponse.body.email).toBe(newDocent.email);
    expect(getResponse.body.img).toBe(newDocent.img);
  });

  test('responds with JSON and retrieves the created docent', async () => {
    const response = await request(app).get(`/api/docenten/${createdDocentId}`);

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body.naam).toBe('Testy');
    expect(response.body.achternaam).toBe('Testman');
    expect(response.body.afkorting).toBe('TETE');
    expect(response.body.email).toBe('te.Testman@summacollege.nl');
    expect(response.body.img).toBe('https://example.com/testy.jpg');
  });

  test('responds with JSON and updates the created docent', async () => {
    const response = await request(app).patch(`/api/docenten/${createdDocentId}`).send({ naam: 'Kiwi' });
  
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body.naam).toBe('Kiwi');
  });
  
  test('responds with JSON and deletes the created docent', async () => {
    const response = await request(app).delete(`/api/docenten/${createdDocentId}`);
  
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
  });
  
});
