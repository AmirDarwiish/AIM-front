import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

export const runtime='nodejs';

/** Serve a binary attachment; a PDF MIME type can still invoke the iOS PDF viewer. */
export async function GET(){
 const file=await readFile(join(process.cwd(),'public/documents/LA-Construction-Portfolio.pdf'));
 return new Response(new Uint8Array(file),{headers:{
  'Content-Type':'application/octet-stream',
  'Content-Disposition':'attachment; filename="LA-Construction-Portfolio.pdf"',
  'Content-Length':String(file.byteLength),
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
 }});
}
