import Alpaca from '@alpacahq/alpaca-trade-api';
import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();
const alpacaKey = process.env.APCA_API_KEY_ID;
const alpacaSecret = process.env.APCA_API_SECRET_KEY;
const openAIToken = process.env.OPEN_API_KEY;

const alpaca = new Alpaca(alpacaKey);

// Server < -- > Data Source
// Communication can go both ways
// Data source can send us information
// We can send data to the data source (Authentication, ask what we want)

// WebSocket are like push notifications on your phone
// Whenever an event happens (texts you, snapchat, anything) you get a notification

const wss = new WebSocket('wss://stream.data.alpaca.markets/v1beta1/news');

wss.on('open', () => {
  console.log('WebSocket connected');
  // We now have to log into the data source

  const authMsg = {
    action: 'auth',
    key: alpacaKey,
    secret: alpacaSecret,
  };

  // Send auth data to ws, 'log us in'
  wss.send(JSON.stringify(authMsg), (error) => {
    if (error) {
      console.log('unable to authenticate');
    } else {
      console.log('auth successful');
    }
  });

  // Subscribe to all news feeds
  const subscribeMsg = {
    action: 'subscribe',
    news: ['*'], // ['TSLA'] example of news feed that we can subscribe to(provided we don't want to subscribe to all news feeds)
  };

  // Connecting us to the live data source of news
  wss.send(JSON.stringify(subscribeMsg), (error) => {
    if (error) {
      console.log('unable to subscribe', error);
    } else {
      console.log('subscribed');
    }
  });
});

wss.on('message', async (message) => {
  const currentEvent = JSON.parse(message)[0];
  if (currentEvent.T === 'n') {
    let companyImpact = 0;

    // This means we have a news event
    // Ask ChatGPT its thought on the headline

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Only respond with a number from 1-100 detailing the impact of the headline',
        },
        {
          role: 'user',
          content:
            "Given the headline '" +
            currentEvent.headline +
            "', show me a number from 1-100 detailing the impact of this headline.",
        },
      ],
    };

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + openAIToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        // data is the ChatGPT response
        console.log(data);
        companyImpact = parseInt(data.choices[0].message.content);
      });

    // Make trades based on the output (of the impact saved in companyImpact)
    const tickerSymbol = currentEvent.symbols[0];

    if (companyImpact >= 70) {
      // Buy stock
      let order = await alpaca.createOrder({
        symbol: tickerSymbol,
        qty: 1,
        side: 'buy',
        type: 'market',
        time_in_force: 'day', // day ends, it wont trade
      });
      if (order) {
        console.log('order created successfully');
      }
    } else if (companyImpact <= 30) {
      // sell stock
      let closePosition = alpaca.closePosition(tickerSymbol);
      if (closePosition) {
        console.log('Position closed successfully');
      }
    }
  }
});
