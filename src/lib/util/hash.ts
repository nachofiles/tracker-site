import bs58 from 'bs58';

export type Multihash = string;
const SHA2_256_PREFIX = Buffer.from([ 0x12, 0x20 ]);

/**
 * Given an ipfs multihash, return the corresponding bytes32 that should be stored on the contract.
 *
 * Asserts a particular hashing algorithm is used.
 * @param ipfsMultihash
 */
export function getBytes32FromIpfsHash(ipfsMultihash: Multihash) {
  const hex = bs58
    .decode(ipfsMultihash);

  if (!hex.slice(0, 2).equals(SHA2_256_PREFIX)) {
    throw new Error('multihash must use hash algorithm sha2-256');
  }

  return '0x' + hex.slice(2).toString('hex');
}

/**
 * Given a bytes32 hex prefixed with 0x, return the corresponding multihash.
 * @param bytes32Hex the 32 bytes that should be converted to a multihash, assuming sha2-256 algorithm
 */
export function getIpfsHashFromBytes32(bytes32Hex: string): Multihash {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = '1220' + bytes32Hex.slice(2);
  const hashBytes = Buffer.from(hashHex, 'hex');
  return bs58.encode(hashBytes);
}