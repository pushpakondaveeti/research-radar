import serverless from 'serverless-http';
import app from '../app.js';

// Unwrap default export object if wrapped by Netlify's esbuild bundler
const expressApp = app.default || app;

export const handler = serverless(expressApp);
