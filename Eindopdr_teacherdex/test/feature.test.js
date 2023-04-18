// Supertest is a javascript library for testing http request
const request = require('supertest');
const app = require('../apiTeacherdex');


describe('GET /api/docenten', () => {
  test('responds with JSON', async () => {
    const response = await request(app).get('/api/docenten');
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
  });
});