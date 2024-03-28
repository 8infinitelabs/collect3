import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { BrowserProvider, ethers } from "ethers";
import MetaMaskOnboarding from '@metamask/onboarding';
import { useUserContext } from "./context/userContext";
import Button from "./components/Button"
import TestSvg from './TestSvg'


const ONBOARD_TEXT = 'Click here to install MetaMask!';
const CONNECT_TEXT = 'Connect';
const CONNECTED_TEXT = 'Connected';

export default function Layout() {
  const [isCorrectNetwork, setCorrectNetwork] = useState<boolean>(false);
  const { walletProvider, setWalletProvider, signer, setSigner } = useUserContext()
  const [buttonText, setButtonText] = useState(ONBOARD_TEXT);
  const [isDisabled, setDisabled] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const onboarding = useRef<MetaMaskOnboarding>();

  async function addNetwork() {
    await window.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x4CB2F',
        chainName: 'Filecoin Tesnet',
        rpcUrls: ['https://api.calibration.node.glif.io/rpc/v1'],
        nativeCurrency: {
          name: 'Filecoin',
          symbol: 'tFIL',
          decimals: 18,
        },
        blockExplorerUrls: ['https://calibration.filfox.info/'],
        iconUrl: ['https://docs.filecoin.io/~gitbook/image?url=https:%2F%2F3376433986-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FxNWFG7bQkjLkl5BBGjbD%252Ficon%252FMFhg0h7DDwlyjF3FRItf%252FFilecoin.svg.png%3Falt=media%26token=b79c504b-c727-4a40-8fc0-7598a5263d24&width=32&dpr=1&quality=100&sign=24d1a215709f4bfc94d151dedabc2b55b9d80dd0993dd16657308232dfb68b02'],
      }],
    });
  }

  async function switchNetwork() {
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x4CB2F' }],
    });
    setCorrectNetwork(true);
  }

  async function verifyNetwork() {
    if (!isCorrectNetwork) {
      try {
        await switchNetwork();
      } catch (e) {
        await addNetwork();
        await switchNetwork();
      }
    }
  }

  useEffect(() => {
    const checkNetwork = async () => {
      const chainId: string = await window?.ethereum?.request({ method: 'eth_chainId' });
      console.log(chainId);
      if (chainId.toLowerCase() === '0x4cb2f') {
        console.log('correct network');
        setCorrectNetwork(true);
      } else {
        console.log('wrong network');
        setCorrectNetwork(false);
      }
    }
    checkNetwork();
    const callback = () => {
      window.location.reload();
    };
    //@ts-ignore
    window.ethereum?.on('chainChanged', callback);

    return () => {
      //@ts-ignore
      window.ethereum?.removeListener('chainChanged', callback);
    }
  }, [])

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts.length > 0) {
        setButtonText(CONNECTED_TEXT);
        setDisabled(true);
        onboarding?.current?.stopOnboarding();
      } else {
        setButtonText(CONNECT_TEXT);
        setDisabled(false);
      }
    }
  }, [accounts]);

  useEffect(() => {
    function handleNewAccounts(newAccounts: string[]) {
      setAccounts(newAccounts);
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.getSigner().then((signer) => {
          setSigner!(signer);
        });
      }
    }
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        ?.request({ method: 'eth_requestAccounts' })
        .then(handleNewAccounts);
      //@ts-ignore
      window.ethereum?.on('accountsChanged', handleNewAccounts);
      return () => {
        //@ts-ignore
        window.ethereum.removeListener('accountsChanged', handleNewAccounts);
      };
    }
  }, []);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        ?.request({ method: 'eth_requestAccounts' })
        .then((newAccounts) => setAccounts(newAccounts));
    } else {
      onboarding?.current?.startOnboarding();
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <TestSvg className="h-6 w-6" />
          <span className="sr-only">Collect3</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button
            onClick={onClick}
            disabled={isDisabled}
          >
            {buttonText}
          </Button>
          {!isCorrectNetwork && (
            <Button
              onClick={verifyNetwork}
              disabled={!!signer || isCorrectNetwork}
            >
              Connect to Filecoin
            </Button>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Collect3. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  )
}
