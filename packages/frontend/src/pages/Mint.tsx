import { useUserContext } from '../context/userContext'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/Button'
import abi from '../utils/abi'

export default function Mint() {
  const { signer } = useUserContext()
  const [id, setId] = useState<number>(0);
  const [minting, setMinting] = useState<boolean>(false)
  const [minted, setMinted] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [contract, setContract] = useState<ethers.BaseContract>()

  const { cid } = useParams();
  //get the url and title from the query parameters

  const fetchData = async () => {
    let localId = 0;
    try {
      const raw = await fetch(`${import.meta.env.VITE_API_URL}/nft/id/${cid}`);
      const json: { id: number } = await raw.json();
      setId(json.id);
      localId = json.id;
    } catch (err) {
      console.log(err)
    }

    // if (!localId) return
    // let localmetadata
    // try {
    //   const raw = await fetch(`http://localhost:8080/nft/metadata/${cid}`);
    //   localmetadata = await raw.json();
    //   console.log(localmetadata)
    // } catch (err) {
    //   console.log(err)
    // }
  }

  useEffect(() => {
    if (cid) {
      fetchData();
    }
  }, [])

  useEffect(() => {
    if (signer) {
      const instance = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        abi,
        signer,
      );
      const parsedContract = instance.connect(signer);
      const balance = async () => {
        //@ts-ignore
        const balance = await parsedContract.balanceOf(signer?.address, id)
        console.log("balance", balance);

        if (balance > 0) {
          console.log("already minted");
          setMinted(true)
        }
      }
      balance();
      setContract(parsedContract);
    }
  }, [signer])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          {!minting && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  NFT TITLE
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  NFT DESCRIPTION
                </p>
              </div>
              <Button
                onClick={async () => {
                  try {
                    setMinting(true)
                    //setMinted(false)
                    setError('')
                    //@ts-ignore
                    const tx = await contract.mint(id)
                    await tx.wait()
                    setMinted(true)
                    try {
                      const raw = await fetch(
                        'http://localhost:8080/nft',
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            uid: `${id}`,
                            cid: cid,
                          }),
                        }
                      );
                      console.log(raw);
                    } catch (err) {
                      console.log(err)
                    }
                    console.log(tx)
                  } catch (err) {
                    console.log(err)
                  } finally {
                    setMinting(false)
                  }
                }}
                disabled={!signer || !contract || minting || minted}
              >
                MINT
              </Button>
            </div>
          )}
          {minting && (
            <div className="space-y-2">
              <div className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Minting...
              </div>
              <div className="flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-l-2 border-blue-500 animate-spin"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
