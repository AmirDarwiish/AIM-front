import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const context={exports:{},Set,Number};
vm.runInNewContext(ts.transpileModule(readFileSync('lib/admin-navigation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
const {parseAdminRoute,adminRecordPath}=context.exports;
const parse=path=>JSON.parse(JSON.stringify(parseAdminRoute(path.split('/').filter(Boolean))));
assert.deepEqual(parse(''),{resource:'overview',action:'list'});
for(const resource of ['projects','services','sections','sliders']){
 assert.deepEqual(parse(`${resource}/new`),{resource,action:'new'});
 assert.deepEqual(parse(`${resource}/15/edit`),{resource,action:'edit',id:15});
 assert.deepEqual(parse(`${resource}/15`),{resource,action:'view',id:15});
 assert.equal(adminRecordPath(parse(resource),'edit',15),`/admin/${resource}/15/edit`);
}
assert.deepEqual(parse('sections/24/items/11/edit'),{resource:'items',action:'edit',sectionId:24,id:11});
assert.equal(adminRecordPath(parse('sections/24/items'),'new'),'/admin/sections/24/items/new');
assert.deepEqual(parse('leads/9'),{resource:'leads',action:'view',id:9});
assert.deepEqual(parse('media/new'),{resource:'media',action:'new'});
for(const path of ['unknown','projects/0','projects/-1/edit','projects/abc','projects/999999999999999999','projects/2/edit/extra','leads/new','leads/2/edit','media/2/edit','sections/2/items/0','settings/new'])assert.equal(parse(path),null,path);
console.log('PASS: direct create/edit/view routes, nested section item routes, strict ID validation and unsupported routes.');
