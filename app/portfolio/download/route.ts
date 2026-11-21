import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

export const runtime='nodejs';

/** Attachment headers make Safari download the file instead of opening its PDF viewer. */
export async function GET(){
 const file=await readFile(join(process.cwd(),'public/documents/LA-Construction-Portfolio.pdf'));
 return new Response(new Uint8Array(file),{headers:{
  'Content-Type':'application/pdf',
  'Content-Disposition':'attachment; filename="LA-Construction-Portfolio.pdf"',
  'Content-Length':String(file.byteLength),
  'Cache-Control':'public, max-age=0, must-revalidate',
  'X-Content-Type-Options':'nosniff',
 }});
}
