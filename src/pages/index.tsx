import { Lucid } from "lucid-cardano";
import * as React from "react";
import { apiNami, clientInstance, lucid } from "../cardano/nft";
const { mint, transferLovelaceToContract } =
  typeof window !== "undefined" ? await import("../cardano/nft") : ({} as any);

const IndexPage = () => {
  const [connected, setConnected] = React.useState(false);

  const [mintParams, setMintParams] = React.useState({
    image: "",
    name: "",
    description: "",
    loading: false,
  });

  const [result, setResult] = React.useState({ success: "", error: "" });
  const [waitingConfirmation, setWaitingConfirmation] = React.useState(false);

  const onChange = async () => {
    await clientInstance()
  }

  const init = async () => {
    const connected = await (window as any)?.cardano?.nami?.isEnabled()
    if (connected) {
      await clientInstance()
      apiNami.experimental.on("accountChange", onChange)
    }
    setConnected(connected);
  };


  React.useEffect(() => {
    init();
  }, []);
  return (
    <div className="relative flex justify-center items-center w-full h-screen bg-slate-900 text-white flex-col">
      <div className="flex flex-col md:flex-row">
        <div className="w-[500px] max-w-[90%] h-[600px] shadow-sm bg-slate-800 rounded-xl flex items-center flex-col p-8">
          <div className="rounded-xl text-xl font-bold mb-6">
            Mint Cogito token
          </div>
          <br></br>
          <button 
            onClick={async () => {
              const txHash = await mint().catch((e: any) => {
                setResult({
                  success: "",
                  error: e?.message || JSON.stringify(e),
                });
              });

              if (txHash) {
                setWaitingConfirmation(true);
                await lucid.awaitTx(txHash);  
                setResult({
                  success: `https://preprod.cardanoscan.io/transaction/${txHash}`,
                  error: "",
                });
                setWaitingConfirmation(false);
              }
              setMintParams((m) => ({ ...m, loading: false }));
            }}
            disabled={
              !connected 
            }
            className="rounded-xl bg-violet-800 py-4 px-8 hover:opacity-80 duration-200 disabled:opacity-30"
          >
            {mintParams.loading ? "..." : "Mint"}
          </button>
        </div>
       
        <button
          onClick={async () => {
            const connected = await (window as any)?.cardano?.nami?.enable();
            if (connected) {
              await lucid.selectWallet(apiNami);
            }
            setConnected(connected);
          }}
          className="absolute right-7 top-7 border-2 rounded-xl border-white p-2  hover:bg-white hover:text-slate-900 duration-300"
        >
          {connected ? "Connected" : "Connect Nami"}
        </button>
      </div>
      {result.error && (
        <div className="mt-6 text-rose-700 text-sm">{result.error}</div>
      )}
      {waitingConfirmation && (
        <div className="mt-6 text-white text-sm">
          Waiting for transaction confirmation...
        </div>
      )}
      {result.success && (
        <a
          href={result.success}
          target="_blank"
          className="mt-6 text-white text-sm underline"
        >
          {result.success}
        </a>
      )}
    </div>
  );
};

const stringToArray = (str: string) => {
  const array = str.match(/.{1,64}/g)!;
  if (array?.length === 1) return array[0] as string;
  return array as string[];
};

export default IndexPage;
