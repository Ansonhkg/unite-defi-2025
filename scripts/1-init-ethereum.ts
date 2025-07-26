import * as Ethereum from "../src/services/Ethereum";

console.log("----- 1-init-ethereum.ts -----");

// 1. Generate a new Ethereum account or get existing one
const accountResult = await Ethereum.getOrCreateAccount();

console.log("✅ Ethereum Private Key:", accountResult.privateKey);
console.log("✅ Ethereum Address:", accountResult.address);

// 2. Save account to state.json (only if it's new)
if (accountResult.isNew) {
  await Ethereum.updateAccount(accountResult);
}

// 3. No API to fund account yet

// 4. Check balance
await Ethereum.checkBalance(accountResult);