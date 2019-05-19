import * as ethers from 'ethers';
import TrackersJSON from '@ethny-tracker/tracker-contracts/build/contracts/Tracker.json';
import { Tracker } from '@ethny-tracker/tracker-contracts/build/types/ethers/Tracker';

const w = window as { ethereum?: any };

const _defaultNetwork = 'ropsten';

export function getTrackerContract(address: string) {
  let provider: ethers.providers.Provider;

  if (w.ethereum) {
    provider = new ethers.providers.Web3Provider(w.ethereum, _defaultNetwork);
  } else {
    provider = ethers.getDefaultProvider(_defaultNetwork);
  }

  return new ethers.Contract(address, TrackersJSON.abi, provider) as Tracker;
}

export async function getSignerTrackerContract(address: string) {
  if (!w.ethereum) {
    throw new Error('Must have a Web3 client (MetaMask, Dapper, etc.');
  }
  const [ account ] = await w.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(w.ethereum);
  const signer = provider.getSigner(account);
  return new ethers.Contract(address, TrackersJSON.abi, signer) as Tracker;
}
