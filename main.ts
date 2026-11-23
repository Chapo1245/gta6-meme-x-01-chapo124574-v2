// gta6-meme-x-01 v2 entry program (Node 22, standard library only).
//
// The entry itself is the X post: the house reads the post from X and hands
// its first picture and its text to the judge. This program only stages the
// two files the entry needs into the output directory:
//   - POST.json     -> the post's address, which the gate reads from /output
//   - gta6-meme.png -> the meme picture itself, as posted
// Both copies are guarded: a missing or empty source refuses to run, and a
// destination whose size differs from its source is reported as a failure.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const FILES = ['POST.json', 'gta6-meme.png'];

// Byte cap the gate enforces downstream: POST.json at most 16,384 bytes.
// Refusing an oversize file here keeps a bad entry from ever reaching the
// gate. The meme picture carries no byte cap of its own: the house reads it
// from the post and scales its copy down to at most 512 px a side, so the
// file is only guarded against being missing or empty, never against size.
const BYTE_CAPS: Record<string, number> = {
  'POST.json': 16384,
};

function copyGuarded(name: string): number {
  const src = join(BOT_DIR, name);
  const dst = join(OUTPUT_DIR, name);
  let size: number;
  try {
    size = statSync(src).size;
  } catch (err) {
    console.error(`cannot read ${name} from ${BOT_DIR}: ${(err as Error).message}`);
    process.exit(1);
  }
  if (size === 0) {
    console.error(`${name} is empty, refusing to copy`);
    process.exit(1);
  }
  const cap = BYTE_CAPS[name];
  if (cap !== undefined && size > cap) {
    console.error(`${name} is ${size} bytes, over the ${cap} byte cap`);
    process.exit(1);
  }
  copyFileSync(src, dst);
  const copied = statSync(dst).size;
  if (copied !== size) {
    console.error(`${name} copy incomplete: ${copied} of ${size} bytes`);
    process.exit(1);
  }
  console.log(`${name}: ${size} bytes -> ${dst}`);
  return size;
}

mkdirSync(OUTPUT_DIR, { recursive: true });
for (const name of FILES) {
  copyGuarded(name);
}
