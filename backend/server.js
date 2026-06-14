import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 5050;

// Unwrap default export object if wrapped
const expressApp = app.default || app;

expressApp.listen(PORT, () => {
  console.log(`Research Radar server running at http://localhost:${PORT}`);
});
