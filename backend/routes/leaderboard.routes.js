const express = require('express');
const r = express.Router();
const c = require('../controllers/leaderboard.controller');

// Public — powers the community leaderboard on the marketing site.
r.get('/', c.getLeaderboard);

module.exports = r;
