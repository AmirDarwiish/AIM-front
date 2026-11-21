import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source=readFileSync(new URL('../app/portfolio/download/route.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const {GET}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const response=await GET();
assert.equal(response.status,200);
assert.equal(response.headers.get('Cache-Control'),'no-store');
assert.equal(response.headers.get('Content-Type'),'application/octet-stream');
assert.match(response.headers.get('Content-Disposition'),/^attachment; filename="LA-Construction-Portfolio.pdf"$/);
const actual=Buffer.from(await response.arrayBuffer());
assert.equal(response.headers.get('Content-Length'),String(actual.byteLength));
assert.equal(actual.subarray(0,5).toString(),'%PDF-');
assert.deepEqual(actual,readFileSync(new URL('../public/documents/LA-Construction-Portfolio.pdf',import.meta.url)));
console.log('PASS: downloads return an attachment with the complete, original PDF.');
