const request = require('supertest');
const app = require('../apiTeacherdex');
// makes the test timeout 20 seconds instead of 5
jest.setTimeout(2000);

describe('GET /api/klassen', () => {
  test('responds with JSON', async () => {
    const response = await request(app).get('/api/klassen');
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
  });
});

describe('GET /api/vakken', () => {
  test('responds with JSON', async () => {
    const response = await request(app).get('/api/vakken');
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
  }, { timeout: 10000 }); // increase timeout for this test
});
