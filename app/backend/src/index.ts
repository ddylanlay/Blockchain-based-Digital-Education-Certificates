import { Hono } from 'hono';
import { cors } from 'hono/cors';
import assets from './routes/assets';
import health from './routes/health';

const app = new Hono();

// CORS middleware - must be applied before routes
app.use('*', cors({
  origin: ['http://localhost:3001', 'http://192.168.0.216:3001', 'http://127.0.0.1:3001'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: false,
}));

// Routes
app.route('/api/assets', assets);
app.route('/health', health);

export default app;