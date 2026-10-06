"use strict";

// Vercel serverless catch-all for /api/*. Delegates to the shared request
// handler in server.js so the same routing works locally (`npm start`) and on
// Vercel. The filename `[...path].js` matches every nested /api route, and
// req.url retains the original path for the handler to dispatch on.
const { handler } = require("../server.js");

module.exports = (req, res) => handler(req, res);
