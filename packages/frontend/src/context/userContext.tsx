//create a context provider for the walletProvider and signer
import { createContext, useState, ReactNode, useContext } from 'react'
import { JsonRpcSigner } from "ethers";

type UserContextType = {
  signer: JsonRpcSigner | undefined,
  setSigner?: (signer: JsonRpcSigner) => void,
};
const initialValue: UserContextType = {
  signer: undefined,
};

type props = {
  children: ReactNode,
};

const UserContext = createContext<UserContextType>(initialValue);

export const UserProvider = ({ children }: props) => {
  const [signer, setSigner] = useState<JsonRpcSigner>();

  return (
    <UserContext.Provider
      value={{ signer, setSigner }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
