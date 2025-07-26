import { promises as fs } from "fs";
import path from "path";
import type { State } from "./types/State";

const statePath = path.join(process.cwd(), "state.json");

export async function read(): Promise<State> {
  try {
    const data = await fs.readFile(statePath, "utf-8");
    return JSON.parse(data) as State;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const defaultState: State = {
        ethereum: {
          privateKey: "",
          address: "",
        },
        stellar: {
          keypair: {
            secret: "",
            public: "",
          },
        },
      };
      return defaultState;
    }
    throw error;
  }
}

export async function write(state: State): Promise<void> {
  try {
    const data = JSON.stringify(state, null, 2);
    await fs.writeFile(statePath, data, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write state: ${error}`);
  }
}

export async function updateStellarKeypair(keypair: {
  secret: string;
  public: string;
}): Promise<void> {
  try {
    const existingState = await readRaw();
    existingState.stellar = existingState.stellar || {};
    existingState.stellar.keypair = keypair;

    const data = JSON.stringify(existingState, null, 2);
    await fs.writeFile(statePath, data, "utf-8");
  } catch (error) {
    throw new Error(`Failed to update stellar keypair: ${error}`);
  }
}

export async function updateEthereumAccount(account: {
  privateKey: string;
  address: string;
}): Promise<void> {
  try {
    const existingState = await readRaw();
    existingState.ethereum = existingState.ethereum || {};
    existingState.ethereum.privateKey = account.privateKey;
    existingState.ethereum.address = account.address;

    const data = JSON.stringify(existingState, null, 2);
    await fs.writeFile(statePath, data, "utf-8");
  } catch (error) {
    throw new Error(`Failed to update ethereum account: ${error}`);
  }
}

async function readRaw(): Promise<any> {
  try {
    const data = await fs.readFile(statePath, "utf-8");
    const trimmedData = data.trim();
    if (!trimmedData) {
      return {};
    }
    return JSON.parse(trimmedData);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    if (error instanceof SyntaxError) {
      return {};
    }
    throw error;
  }
}
