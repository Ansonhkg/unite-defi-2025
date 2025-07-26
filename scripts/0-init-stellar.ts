import * as Stellar from "../src/services/Stellar";

console.log("----- 0-init-stellar.ts -----");

// 1. Generate a new Stellar keypair or get existing one
const keypairResult = await Stellar.createOrGetKeypair();

console.log("✅ Stellar Secret Key:", keypairResult.secret);
console.log("✅ Stellar Public Key:", keypairResult.public);

// 2. Save keypair to state.json (only if it's new)
if (keypairResult.isNew) {
  await Stellar.updateKeypair(keypairResult);
}

// 3. Fund account via Friendbot (testnet only, skips if already funded)
await Stellar.fundAccount(keypairResult);

// 4. Check balance
await Stellar.checkBalance(keypairResult);
