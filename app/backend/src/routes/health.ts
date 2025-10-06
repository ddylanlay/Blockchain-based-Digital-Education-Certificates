import { Hono } from 'hono';
const health = new Hono();

health.get('/', (c) => c.json({ status: 'OK', timestamp: new Date().toISOString() }));

export default health;