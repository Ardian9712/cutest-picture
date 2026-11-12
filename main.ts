// Entry for make.fun's cutest-picture-01 contest (Node 22, standard library only).
//
// The picture: entry.png beside this file -- a cream baby seal pup with big
// eyes and a pale blue bow (a JPEG in spite of its .png name, which the gate
// allows: the first bytes tell the format, and the bytes are what count). This
// program's whole job is to deliver those exact bytes to the grader's output
// directory. Nothing is decoded or re-encoded: the judge sees exactly the bytes
// in the file it reads.
//
// Output location: the grader's writable /output, or $MAKEFUN_OUTPUT_DIR when it
// is set, which is how it is run outside the container:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PICTURE_NAME = 'entry.png';
const DEFAULT_OUTPUT_DIR = '/output';
// The gate takes a picture of at most 1 MiB (1048576 bytes); anything larger is
// refused, so the size is checked before and after the write.
const MAX_PICTURE_BYTES = 1048576;

// Resolve the picture relative to this file, not the current working directory,
// so the entry behaves the same wherever the grader launches it from.
const sourcePath = resolve(import.meta.dirname, PICTURE_NAME);

// Guard 1: the source picture must exist. A missing file is a hard error rather
// than a silent skip, because an empty output directory means an invalid entry.
if (!existsSync(sourcePath)) {
  console.error(`error: source picture '${PICTURE_NAME}' not found at ${sourcePath}`);
  process.exit(1);
}

// Read the picture once into memory, then write those same bytes out.
const pictureBytes = readFileSync(sourcePath);

// Guard 2: fail before writing when the picture is over the 1 MiB limit, so no
// oversized file is ever left behind in the output directory.
if (pictureBytes.byteLength > MAX_PICTURE_BYTES) {
  console.error(
    `error: '${PICTURE_NAME}' is ${pictureBytes.byteLength} bytes, over the ${MAX_PICTURE_BYTES} byte (1 MiB) limit`
  );
  process.exit(1);
}

// Guard 3: make sure the destination directory exists before writing into it.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
mkdirSync(outputDir, { recursive: true });

const targetPath = resolve(outputDir, PICTURE_NAME);
writeFileSync(targetPath, pictureBytes);

// Guard 4: confirm the file that actually landed on disk is within the limit,
// since the grader reads that file and nothing else.
const writtenBytes = statSync(targetPath).size;
if (writtenBytes > MAX_PICTURE_BYTES) {
  console.error(
    `error: wrote ${writtenBytes} bytes to ${targetPath}, over the ${MAX_PICTURE_BYTES} byte (1 MiB) limit`
  );
  process.exit(1);
}

console.log(`wrote ${writtenBytes} bytes to ${targetPath} (limit ${MAX_PICTURE_BYTES})`);
