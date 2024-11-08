/* eslint-disable @typescript-eslint/no-unused-vars */
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoochProvider, WalletProvider } from "@roochnetwork/rooch-sdk-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { networkConfig } from "./networks";

import './index.css'

import Main from "./pages/Main";
import Game from "./pages/Game";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Main />
      </>
    ),
  },
  {
    path: "/game",
    element: (
      <>
        <Game />
      </>
    ),
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider chain={"bitcoin"} autoConnect>
          <Toaster/>
          <RouterProvider router={router} />
        </WalletProvider>
        </RoochProvider>
    </QueryClientProvider>
  );
}