import { BrowserProvider, ethers } from "ethers";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useUserContext } from "./context/userContext";
import Button from "./components/Button"
import TestSvg from './TestSvg'

export default function Layout() {
  const [isCorrectNetwork, setCorrectNetwork] = useState<boolean>(false);
  const { walletProvider, setWalletProvider, signer, setSigner } = useUserContext()

  function handleEthereum() {
    window.removeEventListener('ethereum#initialized', handleEthereum);
    const ethereum = window.ethereum;
    if (ethereum) {
      const provider = new ethers.BrowserProvider(ethereum);
      setWalletProvider!(provider);
    }
    else {
      setWalletProvider!(ethers.getDefaultProvider())
    }
  }

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
    if (window.ethereum) {
      handleEthereum();
    } else {
      window.addEventListener('ethereum#initialized', handleEthereum, { once: true });
      const timeoutId = setTimeout(() => {
        handleEthereum();
      }, 3000);
      return () => {
        window.removeEventListener('ethereum#initialized', handleEthereum);
        clearTimeout(timeoutId)
      }
    }
  }, [])

  useEffect(() => {
    if (walletProvider) {
      const checkNetwork = async () => {
        const network = await walletProvider?.getNetwork()
        if (!network) return
        let chainId = parseInt(network?.chainId.toString());
        if (chainId === 314159) {
          setCorrectNetwork(true);
        } else {
          setCorrectNetwork(false);
        }
      }
      checkNetwork();
    }
  }, [walletProvider])

  useEffect(() => {
    if (walletProvider) {
      walletProvider.on('chainChanged', () => {
        window.location.reload();
      })

      return () => {
        walletProvider.removeListener('chainChanged', () => {
          window.location.reload();
        })
      }
    }
  }, [walletProvider])

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <TestSvg className="h-6 w-6" />
          <span className="sr-only">Collect3</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button
            onClick={async () => {
              if (walletProvider && (walletProvider as BrowserProvider)?.getSigner && !signer) {
                setSigner!(await (walletProvider as BrowserProvider).getSigner());
              }
            }}
            disabled={!!signer}
          >
            {!signer ? 'Connect to Wallet' : 'Connected to Wallet'}
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
