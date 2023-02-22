import {
  Lucid,
  Tx,
  Blockfrost,
  Data,

  Redeemer,
  Datum,
  MintingPolicy,
} from "lucid-cardano";
import scripts from "./scripts.json";
import {BLOCKFROST_API} from "./secret";


export const lucid = await Lucid.new(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", BLOCKFROST_API),
  "Preprod",
)

export const apiNami = await (window as any)?.cardano?.nami?.enable()
export const clientInstance = async () => {
  return lucid.selectWallet(apiNami)
}



const { someContract, tokenPolicy } = scripts;

const contractAddress = lucid.utils.validatorToAddress({
  type: "PlutusV2",
  script: someContract,
});

const tokenPolicyScript: MintingPolicy = {
  type: "PlutusV1",
  script: tokenPolicy,
}
const tokenPolicyId = lucid.utils.mintingPolicyToId(tokenPolicyScript);
const calculateUnit = (currency: string, prefix: string, number: number) =>
 (currency + Buffer.from(prefix + number).toString("hex"))


const findPubKeyHash = async () => {
  const walletAddr = (await apiNami.getUsedAddresses())[0]
  return walletAddr.slice(2, 58)
}
export const pubKeyHash:string = await findPubKeyHash();

const emptyData = Data.void();


export const transferLovelaceToContract = async () => {
 
  const tx = await lucid
    .newTx()
    .payToContract(contractAddress, { inline: emptyData }, {lovelace: 2000000n,})
    .complete();

  const signedTx = await tx.sign().complete();

  const txHash = await signedTx.submit();
  return txHash;
};


export const mint = async () => {
 
  const token = calculateUnit(tokenPolicyId, "Cogito", 1)  
  const toMint = {[token]: 1n}

  const tx = await lucid
    .newTx()
    .mintAssets(toMint, emptyData)
    .attachMintingPolicy(tokenPolicyScript)
    .complete();

  const signedTx = await tx.sign().complete();

  const txHash = await signedTx.submit();
  return txHash;
};

