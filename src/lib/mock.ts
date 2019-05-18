import { Inode } from './db';

const categories = [
  'Book',
  'Movie',
  'Video',
  'Game',
  'Document',
  'Photo',
  'Audio',
  'Data',
];

const mimes = [
  'audio/aac',
  'image/bmp',
  'text/csv',
  'audio/midi',
  'video/mpeg',
  'video/ogg',
  'image/svg+xml',
  'application/zip'
];

async function generateTitle(): Promise<string> {
  const res = await fetch('https://corporatebs-generator.sameerkumar.website/');
  const data = await res.json();
  return data.phrase;
}

export async function generateInode(): Promise<Inode> {
  const inode = {
    id: Math.floor(Math.random() * 10000000000000000).toString(16),
    description: 'Lorem ipsum etc. etc.',
    title: await generateTitle(),
    author: Math.floor(Math.random() * 10000000000000000).toString(16),
    category: categories[Math.floor(Math.random() * categories.length)],
    mimeType: mimes[Math.floor(Math.random() * mimes.length)],
    createdAt: Date.now(),
    sizeBytes: Math.floor(Math.random() * 1000000000000),
    dataUri: `ipfs://${Math.floor(Math.random() * 10000000000000000).toString(16)}`,
  };
  return inode;
}
