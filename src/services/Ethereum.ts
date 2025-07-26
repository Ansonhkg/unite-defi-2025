import * as StateManager from "../StateManager";
import { ethers } from "ethers";

export async function getOrCreateAccount(): Promise<{
  privateKey: string;
  address: string;
  isNew: boolean;
}> {
  try {
    // Try to read existing state
    const state = await StateManager.read();

    // Check if account exists and is valid (not empty strings)
    if (
      state.ethereum?.privateKey &&
      state.ethereum?.address &&
      state.ethereum.privateKey !== "" &&
      state.ethereum.address !== ""
    ) {
      console.log("📁 Using existing account from state.json");
      return {
        privateKey: state.ethereum.privateKey,
        address: state.ethereum.address,
        isNew: false,
      };
    } else {
      console.log("📂 No valid account found in state, generating new one");
    }
  } catch (error) {
    console.log("⚠️ Could not read existing state, generating new account");
  }

  // Generate new account if none exists
  console.log("🔄 Generating new Ethereum account...");
  const account = ethers.Wallet.createRandom();
  return {
    privateKey: account.privateKey,
    address: account.address,
    isNew: true,
  };
}

export async function updateAccount(account: {
  privateKey: string;
  address: string;
}) {
  try {
    // Check if this account is already in state to avoid unnecessary writes
    const state = await StateManager.read();
    if (
      state.ethereum?.privateKey === account.privateKey &&
      state.ethereum?.address === account.address
    ) {
      console.log("📁 Account already saved in state.json");
      return;
    }

    console.log("💾 Saving account to state.json");
    await StateManager.updateEthereumAccount({
      privateKey: account.privateKey,
      address: account.address,
    });
  } catch (error) {
    console.log("⚠️ Could not save account to state:", error);
  }
}

export async function checkBalance(account: {
  privateKey: string;
  address: string;
}) {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-sepolia-rpc.publicnode.com"
  );
  const balance = await provider.getBalance(account.address);
  console.log("💰 Ethereum Balance:", ethers.utils.formatEther(balance));
}
