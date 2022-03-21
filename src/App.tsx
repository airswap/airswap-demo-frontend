import { useState } from 'react'
import './App.css'
import { Button } from 'react-bootstrap'
import useMetaMask from './hooks/metamask';

import { Server } from "@airswap/libraries";
import { findTokensBySymbol } from "@airswap/metadata";
import { Order, Pricing, TokenInfo } from "@airswap/typescript";

const LOCATOR = 'ws://localhost:3000'

type Pair = {
  baseToken: string;
  quoteToken: string;
};

function App() {

  const { chainId, connect, disconnect, isActive, account, shouldDisable } = useMetaMask()
  const [pricing, updatePricing] = useState<Pricing[]>([]);

  console.log(chainId)

  /*
  const baseToken: TokenInfo = findTokensBySymbol('WETH', chainId)[0];
  const quoteToken: TokenInfo = findTokensBySymbol('USDT', chainId)[0];
  */



  const pair: Pair = { baseToken: 'baseToken.address', quoteToken: 'quoteToken.address'}

  const server: Server = new Server('ws://localhost:3000')
  const handlePricing = (pricing: Pricing[]) => {
    updatePricing(
      pricing,
    )
  };

  server.on("pricing", handlePricing.bind(null));
  server.on("error", (e) => {
    console.error(
      `RPC WebSocket error: [${server.locator}]: ${e.code} - ${e.message}`,
      e
    );
  });

  const initialPricing = server.subscribe([pair]).then(initialPricing => {
    handlePricing(initialPricing);
  });

  return (
    <div className="App">
      <header className="App-header">
        <Button variant="secondary" onClick={connect} disabled={shouldDisable}>
          <img src="images/metamask.svg" alt="MetaMask" width="50" height="50" /> Connect to MetaMask
        </Button>
        <div className="mt-2 mb-2">
          Connected Account: { isActive ? account : '' }
        </div>
        <Button variant="danger" onClick={disconnect}>
          Disconnect MetaMask<img src="images/noun_waving_3666509.svg" width="50" height="50" />
        </Button>
      </header>
    </div>
  );
}

export default App;
