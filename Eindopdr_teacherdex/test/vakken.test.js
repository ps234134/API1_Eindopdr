// npx jest to run the test ;)
const request = require('supertest');
const app = require('../apiTeacherdex');
// makes the test timeout 20 seconds instead of 5
jest.setTimeout(2000);

describe('GET /api/vakken', () => {
    test('responds with JSON', async () => {
      const response = await request(app).get('/api/vakken');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
    }, { timeout: 30000 });
  });
  
  describe('GET /api/vakken/:id', () => {
    test('responds with JSON', async () => {
      const response = await request(app).get('/api/vakken/64254e0ec0286f6429f08ddc');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
    });
  });
