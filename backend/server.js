import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Research Radar server running at http://localhost:${PORT}`);
});
