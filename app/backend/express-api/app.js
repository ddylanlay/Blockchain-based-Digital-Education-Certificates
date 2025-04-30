import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // For handling Cross-Origin Requests
import certificateRoutes from './routes/certificate.routes.js';

const app = express();
const PORT = 5000; // You can choose any port

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Routes
app.use('/api', certificateRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});