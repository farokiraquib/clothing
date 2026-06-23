const QIKINK_API_BASE = process.env.QIKINK_API_URL || 'https://sandbox.qikink.com/api';


let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Gets a valid Qikink API access token.
 */
export const getQikinkToken = async () => {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const clientId = process.env.QIKINK_CLIENT_ID;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Qikink credentials not configured in environment variables.');
  }

  const params = new URLSearchParams();
  params.append('ClientId', clientId);
  params.append('client_secret', clientSecret);

  try {
    const response = await fetch(`${QIKINK_API_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to authenticate with Qikink: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Check if the response contains the expected token
    const token = data.access_token || data.Accesstoken;
    if (token) {
      accessToken = token;
      // Expires in seconds, so we multiply by 1000 to get ms, and subtract 1 minute (60000ms) for a buffer
      tokenExpiresAt = Date.now() + ((data.expires_in || 3600) * 1000) - 60000;
      return accessToken;
    } else {
      throw new Error(`Invalid response from Qikink authentication: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('Qikink Auth Error:', err);
    throw err;
  }
};

/**
 * Creates an order in Qikink.
 * @param {Object} orderData The mapped order data for Qikink
 */
export const createQikinkOrder = async (orderData) => {
  try {
    const token = await getQikinkToken();

    const response = await fetch(`${QIKINK_API_BASE}/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ClientId': process.env.QIKINK_CLIENT_ID,
        'Accesstoken': token
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qikink Order Creation Failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Qikink Order Error:', err);
    throw err;
  }
};
