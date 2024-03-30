## CRYPTO TRADING BOT

This is a cryptocurrency trading bot.

With this bot, you can trade cryptocurrency using news gotten from alpaca and analyzed by chatgpt. When chatgpt returns with a 70% value, a buy trade will be initiated on alpaca and if the return is 30% or below, a sell order is initiated.

# Features and npm packages

1. @alpacahq/alpaca-trade-api - this is used to connect with alpaca market place for trading

1. dotenv - this is used to save secret keys

1. ws - this is websocket to listen to events and make the necessary order.

# Prerequisites

Before running the project, make sure you have the following packages installed:

1. Node.js
1. npm or yarn package manager

# Installation

1. Clone the repository.
1. Install dependencies.
1. Configure environment variables
