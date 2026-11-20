import assert from 'node:assert/strict';
import {projectsForService,servicesForProject,projectChapters} from '../lib/portfolio-content.ts';
const projects=[{id:1,slug:'al-amir',title:'Renamed project',category:'Changed category'},{id:2,slug:'purity',title:'Purity'},{id:3,slug:'ap-apartment',title:'AP'},{id:4,slug:'mep-site-works',title:'MEP'},{id:5,slug:'future-construction',title:'Future',category:'أعمال إنشائية'},{id:6,slug:'future-interior',title:'Interior',category:'Interior finishing'}];
assert.deepEqual(projectsForService(27,projects).map(p=>p.id),[1,2,5]);
assert.deepEqual(projectsForService(28,projects).map(p=>p.id),[3,6]);
assert.deepEqual(projectsForService(43,projects).map(p=>p.id),[4]);
assert.deepEqual(projectsForService(29,projects),[]);
assert.deepEqual(projectsForService(44,projects),[]);
assert.deepEqual(projectsForService(999,projects),[]);
assert.deepEqual(servicesForProject(projects[0]),[27]);
for(const lang of ['ar','en'])for(const count of [1,3,4,5,7,12,13,21]){
 const assets=Array.from({length:count},(_,i)=>({id:i+1,kind:'image',url:`https://example.com/${i}.jpg`}));
 const groups=projectChapters(projects[0],assets,lang);
 assert.deepEqual(groups.flatMap(g=>g.assets),assets);
 assert.ok(groups.every(g=>g.title&&g.description));
 if(count>4)assert.ok(groups.every(g=>g.assets.length>=2));
 assert.ok(groups.every(g=>g.assets.length<=5));
}
console.log('PASS: relevant service relationships in both category languages, renamed project preservation, no fabricated design/management portfolio, photo groups preserve every image in order with no trailing singleton.');
