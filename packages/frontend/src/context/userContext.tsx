//create a context provider for the walletProvider and signer
import { createContext, useState, ReactNode, useContext } from 'react'
import { BrowserProvider, AbstractProvider, JsonRpcSigner } from "ethers";

type UserContextType = {
  walletProvider: BrowserProvider | AbstractProvider | undefined,
  signer: JsonRpcSigner | undefined,
  setWalletProvider?: (walletProvider: BrowserProvider | AbstractProvider) => void,
  setSigner?: (signer: JsonRpcSigner) => void,
};
const initialValue: UserContextType = {
  walletProvider: undefined,
  signer: undefined,
};

type props = {
  children: ReactNode,
};

const UserContext = createContext<UserContextType>(initialValue);

export const UserProvider = ({ children }: props) => {
  const [walletProvider, setWalletProvider] = useState<BrowserProvider | AbstractProvider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();

  return (
    <UserContext.Provider
      value={{ walletProvider, signer, setWalletProvider, setSigner }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
