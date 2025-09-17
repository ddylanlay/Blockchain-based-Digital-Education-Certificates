import { Hono } from 'hono';
import assets from './routes/assets';
import health from './routes/health';

const app = new Hono();

// Routes
app.route('/api/assets', assets);
app.route('/health', health);

export default app;