import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {serviceImage} from '../lib/service-images.ts';
for(const id of [29,44]){
 const cover=serviceImage({id});
 assert.ok(cover);
 assert.ok(existsSync(new URL(`../public${cover}`,import.meta.url)));
 assert.equal(serviceImage({id,imageUrl:'  '}),cover);
 assert.equal(serviceImage({id,imageUrl:'https://example.com/new-cover.webp'}),'https://example.com/new-cover.webp');
}
assert.equal(serviceImage({id:999}),undefined);
console.log('PASS: both missing service covers exist; later CMS uploads override defaults.');
