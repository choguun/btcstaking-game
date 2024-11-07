/* eslint-disable @typescript-eslint/no-unused-vars */
import { RoochProvider, WalletProvider } from "@roochnetwork/rooch-sdk-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { networkConfig } from "./networks.ts";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
        <RoochProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider chain={"bitcoin"} autoConnect>
            <App />
        </WalletProvider>
      </RoochProvider>
    </QueryClientProvider>
  </StrictMode>,
)
