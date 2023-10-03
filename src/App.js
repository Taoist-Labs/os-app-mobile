import { useEffect, useState } from "react";
import RouterLink from "./router/router";
import {BrowserRouter as Router} from "react-router-dom";
import { Provider } from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import store,{persistor} from "./store";
import "./locales"
import "./assets/styles/custom.scss"
import "./assets/styles/quill.css";

import GlobalStyle from "./utils/GlobalStyle";

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import InstallCheck from "components/installPWA";


const chains = [mainnet]
const projectId = 'da76ddd6c7d31632ed7fc9b88e28a410'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, chains }),
    publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains);



function App() {
  const [isInstalled, setIsInstalled] = useState(true);
  
  useEffect(() => {
      if (
          window.navigator?.standalone === true ||
          window.matchMedia("(display-mode: standalone)").matches
      ) {
          console.log("isInstalled: true. Already in standalone mode");
          setIsInstalled(true);
      } else {
          console.log("isInstalled: false");
          setIsInstalled(false);
      }
  
  }, []);
  return (
    <div >
        <WagmiConfig config={wagmiConfig}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor} >
                    <Router>
                        <RouterLink />
                    </Router>
                </PersistGate>
            </Provider>
            <GlobalStyle />

            <Web3Modal projectId={projectId} ethereumClient={ethereumClient}
                       explorerRecommendedWalletIds={[
                           'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
                           // '80c7742837ad9455049270303bccd55bae39a9e639b70d931191269d3a76320a',
                           // '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
                       ]}
                       explorerExcludedWalletIds="ALL"
            />
        </WagmiConfig>
        {!isInstalled && <InstallCheck />}
    </div>
  );
}

export default App;
