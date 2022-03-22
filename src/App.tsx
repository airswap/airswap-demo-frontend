import { useState } from 'react'
import './App.css'
import { Button } from 'react-bootstrap'
import useMetaMask from './hooks/metamask';

import { chainNames } from "@airswap/constants"
import { Server } from "@airswap/libraries";
import { getCostFromPricing } from "@airswap/utils"
import { fetchTokens, findTokensBySymbol } from "@airswap/metadata";
import { Pricing } from "@airswap/typescript";

const swapDeploys = require('@airswap/swap/deploys.js')

const SERVER_URL = 'ws://localhost:3000'
let connecting = false
let connected = false
let baseToken = ''
let quoteToken = ''

type Pair = {
  baseToken: string;
  quoteToken: string;
};

function App() {

  const { chainId, connect, isActive, account, shouldDisable } = useMetaMask()
  const [amount, updateAmount] = useState<string>('1');
  const [pricing, updatePricing] = useState<Pricing[]>();
  const [lastUpdate, updateLastUpdate] = useState<string>()

  const handlePricing = (pricing: Pricing[]) => {
    updateLastUpdate(new Date().toLocaleTimeString())
    updatePricing(pricing)
  };

  if (chainId && !connecting && !connected) {
    connecting = true

    fetchTokens(chainId).then(({ tokens }) => {
      baseToken = findTokensBySymbol('WAVAX', tokens)[0].address;
      quoteToken = findTokensBySymbol('AST', tokens)[0].address;
      const pair: Pair = { baseToken, quoteToken }

      Server.at(SERVER_URL, {
        swapContract: swapDeploys[chainId]
      }).then(server => {
        connecting = false
        connected = true
        server.on("pricing", handlePricing.bind(null));
        server.on("error", (e) => {
          console.error(
            `RPC WebSocket error: [${server.locator}]: ${e.code} - ${e.message}`,
            e
          );
        });
        server.subscribe([pair]).then(handlePricing);
      });

    })
  }

  let cost = '?'
  if (connected && pricing && amount) {
    cost = String(getCostFromPricing('buy', amount, baseToken, quoteToken, pricing))
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="mt-2 mb-2">
          <Button variant="secondary" onClick={connect} disabled={shouldDisable}>
            Connect to MetaMask
          </Button>
        </div>
        <div className="mt-2 mb-2">
          Buy: <input value={amount} onChange={e => updateAmount(e.target.value)} /> WAVAX
        </div>
        <div className="mt-2 mb-2">
          [ Cost: { cost }, Updated: { lastUpdate } ]
        </div>
        <div className="mt-2 mb-2">
          [ Account: { isActive ? account : '' }, Chain: { chainNames[chainId] } ]
        </div>
      </header>
    </div>
  );
}

export default App;
