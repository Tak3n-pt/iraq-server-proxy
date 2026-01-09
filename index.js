const express = require('express');
const cors = require('cors');
const dns = require('dns');

// Force IPv4 for outbound connections
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const IRAQ_SERVER_URL = 'https://iraqserver.legacy-api.io/api/';

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Iraq-Server Proxy Running' });
});

// Proxy endpoint - forwards all requests to Iraq-Server
app.post('/api/proxy', async (req, res) => {
  try {
    const { username, apiaccesskey, action, ...params } = req.body;

    if (!username || !apiaccesskey || !action) {
      return res.status(400).json({ error: 'Missing required fields: username, apiaccesskey, action' });
    }

    const body = new URLSearchParams({
      username,
      apiaccesskey,
      action,
      ...params
    });

    console.log(`[Proxy] Action: ${action}`);

    const response = await fetch(IRAQ_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Iraq-Server Proxy running on port ${PORT}`);
});
