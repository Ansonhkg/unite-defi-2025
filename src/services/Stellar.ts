import * as StellarSDK from "stellar-sdk";
import * as StateManager from "../StateManager";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

export async function createOrGetKeypair(): Promise<{
  secret: string;
  public: string;
  isNew: boolean;
}> {
  try {
    // Try to read existing state
    const state = await StateManager.read();

    // Check if keypair exists and is valid (not empty strings)
    if (
      state.stellar?.keypair?.secret &&
      state.stellar?.keypair?.public &&
      state.stellar.keypair.secret !== "" &&
      state.stellar.keypair.public !== ""
    ) {
      console.log("📁 Using existing keypair from state.json");
      return {
        secret: state.stellar.keypair.secret,
        public: state.stellar.keypair.public,
        isNew: false,
      };
    } else {
      console.log("📂 No valid keypair found in state, generating new one");
    }
  } catch (error) {
    console.log("⚠️ Could not read existing state, generating new keypair");
  }

  // Generate new keypair if none exists
  console.log("🔄 Generating new Stellar keypair...");
  const pair = StellarSDK.Keypair.random();
  const keypair = {
    secret: pair.secret(),
    public: pair.publicKey(),
    isNew: true,
  };
  return keypair;
}

export async function updateKeypair(keypair: {
  secret: string;
  public: string;
}) {
  try {
    // Check if this keypair is already in state to avoid unnecessary writes
    const state = await StateManager.read();
    if (
      state.stellar?.keypair?.secret === keypair.secret &&
      state.stellar?.keypair?.public === keypair.public
    ) {
      console.log("📁 Keypair already saved in state.json");
      return;
    }

    console.log("💾 Saving keypair to state.json");
    await StateManager.updateStellarKeypair({
      secret: keypair.secret,
      public: keypair.public,
    });
  } catch (error) {
    console.log("⚠️ Could not save keypair to state:", error);
  }
}

export async function fundAccount(keypair: { secret: string; public: string }) {
  console.log("🔄 Checking if account is already funded...");

  const server = new StellarSDK.Horizon.Server(HORIZON_URL);

  try {
    // Try to load the account - if it exists, it's already funded
    await server.loadAccount(keypair.public);
    console.log("✅ Account is already funded, skipping Friendbot");
    return;
  } catch (error: any) {
    // Account doesn't exist, needs funding
    if (error.name === "NotFoundError") {
      console.log("🔄 Account not found, funding via Friendbot...");
      const fundResponse = await fetch(
        `https://friendbot.stellar.org/?addr=${keypair.public}`
      );
      if (fundResponse.ok) {
        console.log("✅ Account funded successfully");
      } else {
        console.log("❌ Failed to fund account");
      }
    } else {
      console.log("❌ Error checking account status:", error);
    }
  }
}

export async function checkBalance(keypair: {
  secret: string;
  public: string;
}) {
  console.log("🔄 Checking balance...");
  const server = new StellarSDK.Horizon.Server(HORIZON_URL);
  const account = await server.loadAccount(keypair.public);
  console.log("💰 Stellar Balance:", account.balances);
}

StellarSDK.Asset.native()