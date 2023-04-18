// npx jest to run the test ;)
const request = require('supertest');
const app = require('../apiTeacherdex');
let createdDocentId;

describe('POST /api/docenten', () => {
  test('creates, retrieves, updates, and deletes a new docent', async () => {
    const newDocent = {
      naam: 'Testy',
      achternaam: 'Testman',
      afkorting: 'TETE',
      email: 'te.Testman@summacollege.nl',
      img: 'https://example.com/testy.jpg'
    };

    // create a new docent
    let response = await request(app)
      .post('/api/docenten')
      .send(newDocent);

    expect(response.status).toBe(201);
    expect(response.type).toBe('text/html');
    createdDocentId = response.body._id;

    // retrieve the docent and check if it's correct
    response = await request(app).get(`/api/docenten/${createdDocentId}`);

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body.naam).toBe(newDocent.naam);
    expect(response.body.achternaam).toBe(newDocent.achternaam);
    expect(response.body.afkorting).toBe(newDocent.afkorting);
    expect(response.body.email).toBe(newDocent.email);
    expect(response.body.img).toBe(newDocent.img);

    // update the created docent and check if it's correct
    response = await request(app)
      .patch(`/api/docenten/${createdDocentId}`)
      .send({ naam: 'Kiwi' });

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    expect(response.body.naam).toBe('Kiwi');

    // delete the docent 
    response = await request(app).delete(`/api/docenten/${createdDocentId}`);

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');

    // check if the docent is deleted, a 404 should pop up
    response = await request(app).get(`/api/docenten/${createdDocentId}`);
    expect(response.status).toBe(404);
  });
});
