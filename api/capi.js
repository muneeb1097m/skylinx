import crypto from 'crypto';

function hashValue(val) {
  if (!val) return undefined;
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventName, eventId, userData, customData, eventSourceUrl } = req.body;

  const pixelId = '27207133435652052';
  const accessToken = process.env.META_ACCESS_TOKEN || 'EAAYdqrXSTFEBRh4OTtWreTLiIZAgEzycfRQA9Ax9g3nuXk1AhxUwWYZCkcfZCCZBaXFEZCuEbmI5VtuC27yAxjtwMT78DA4YIwOzG02gUMbeR5YIaavSDV2cMZCvSnEdQMQnB76fEW7X1yqCewx4o6eUSfYo7pZBqwEpKEr5gEWQtLwOSN5VeFGQFS1SZA1zHtLb1gZDZD';

  // Extract client IP and user agent from request headers
  const clientIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const clientUserAgent = req.headers['user-agent'];

  const eventTime = Math.floor(Date.now() / 1000);

  const hashedUserData = {
    client_ip_address: clientIpAddress,
    client_user_agent: clientUserAgent
  };

  if (userData) {
    if (userData.email) hashedUserData.em = [hashValue(userData.email)];
    if (userData.firstName) hashedUserData.fn = [hashValue(userData.firstName)];
    if (userData.lastName) hashedUserData.ln = [hashValue(userData.lastName)];
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        user_data: hashedUserData,
        custom_data: customData,
        event_source_url: eventSourceUrl || req.headers.referer,
        action_source: 'website'
      }
    ]
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error) {
    console.error('Meta CAPI Error:', error);
    return res.status(500).json({ error: 'Failed to send event' });
  }
}
