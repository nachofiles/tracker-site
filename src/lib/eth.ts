import * as ethers from 'ethers';
import { abi, networks } from '@ethny-tracker/tracker-contracts/build/contracts/Tracker.json';
import { Tracker } from '@ethny-tracker/tracker-contracts/build/types/ethers/Tracker';
import { Provider } from 'ethers/providers';

const w = window as { ethereum?: any };

const DEFAULT_NETWORK_FOR_FALLBACK = 'ropsten';

let provider: Provider | null = null;

/**
 * Return the singleton provider.
 */
export async function getEthereumProvider(): Promise<Provider> {
  if (provider !== null) {
    return provider;
  }

  if (w.ethereum) {
    provider = new ethers.providers.Web3Provider(w.ethereum);
  } else {
    provider = ethers.getDefaultProvider(DEFAULT_NETWORK_FOR_FALLBACK);
  }

  return provider;
}

/**
 * Return a reference to the tracker contract on the current network.
 */
export async function getTrackerContract(): Promise<Tracker> {
  const provider: ethers.providers.Provider = await getEthereumProvider();

  const network = await provider.getNetwork();

  const chainIdString: string = '' + network.chainId;

  if (!(networks as any)[ chainIdString ]) {
    throw new Error('Tracker is not deployed on the selected network.');
  } else {
    const address: string = (networks as any)[ chainIdString ].address;

    return new ethers.Contract(address, abi, provider) as Tracker;
  }
}

/**
 * Returns the tracker contract with a signer, if available. Otherwise rejects.
 */
export async function getSignerTrackerContract(): Promise<Tracker> {
  if (w.ethereum) {
    const [ account ] = await w.ethereum.enable();

    const trackerContract = await getTrackerContract();

    const provider = await getEthereumProvider();

    return trackerContract.connect((provider as any).getSigner(account)) as Tracker;
  } else {
    throw new Error('Must have a Web3 client to create transactions (e.g. MetaMask, Dapper, ...)');
  }
}
