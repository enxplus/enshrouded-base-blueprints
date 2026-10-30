'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'plan.js'),'utf8'),sandbox);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'reference-layout.js'),'utf8'),sandbox);
const p = sandbox.window.CASTLE_PLAN;
const overlaps = (a,b) => Math.abs(a.x-b.x)<(a.w+b.w)/2-0.01 && Math.abs(a.y-b.y)<(a.d+b.d)/2-0.01;
const contains = (a,x,y) => x>=a.x-a.w/2 && x<=a.x+a.w/2 && y>=a.y-a.d/2 && y<=a.y+a.d/2;

test('28 unique survivors, 16 ground-floor artisans, 28 unique bed positions',()=>{
  assert.equal(p.npcs.length,28);
  assert.equal(new Set(p.npcs.map(n=>n[1])).size,28);
  assert.ok(p.npcs.slice(0,16).every(n=>n[5]===0 && n[8]===4));
  assert.equal(new Set(p.npcs.map(n=>n.slice(6,9).join(','))).size,28);
});
test('all workshop residents and their 16 loft beds are inside their footprints',()=>{
  for(const n of p.npcs.slice(0,16)) {
    if(n[9]==='workshops') assert.ok(p.workshops.some(w=>contains(w,n[3],n[4])),n[0]+' station');
    assert.ok(p.workshops.some(w=>contains(w,n[6],n[7])),n[0]+' bed');
  }
});
test('five castle floors retain the specified dimensions and heights',()=>{
  assert.equal(p.castleFloors.map(f=>f.w).join(','),'32,24,20,16,12');
  assert.equal(p.castleFloors.map(f=>f.h).join(','),'8,16,24,32,40');
  for(const f of p.castleFloors) for(const [name,x,y] of f.items) assert.ok(contains({x:0,y:p.castle.y,w:f.w,d:f.w},x,y),name);
});
test('castle residents and beds lie in the correct castle floor',()=>{
  for(const n of p.npcs.filter(n=>n[9]==='castle')){
    const f=p.castleFloors.find(f=>f.h===n[5]);
    assert.ok(f); assert.ok(contains({x:0,y:p.castle.y,w:f.w,d:f.w},n[3],n[4]));
    assert.equal(n[8],n[5]); assert.ok(contains({x:0,y:p.castle.y,w:f.w,d:f.w},n[6],n[7]));
  }
});
test('seven workshop footprints do not overlap',()=>{
  for(let i=0;i<p.workshops.length;i++) for(let j=i+1;j<p.workshops.length;j++) assert.ok(!overlaps(p.workshops[i],p.workshops[j]),p.workshops[i].name+' / '+p.workshops[j].name);
});
test('reference wings, nursery, mill, keeper, platform, pens and detached houses do not overlap',()=>{
  const shapes=[...p.wings,p.nursery,p.mill,p.keeper,p.castle.platform,...p.pens,...p.cottages];
  for(let i=0;i<shapes.length;i++)for(let j=i+1;j<shapes.length;j++)assert.ok(!overlaps(shapes[i],shapes[j]),'footprints '+i+' / '+j);
});
test('nine animal species and exactly three cats plus three dogs',()=>{
  assert.equal(p.animals.length,9); assert.equal(new Set(p.animals.map(a=>a[0])).size,9);
  assert.equal(p.pets.length,6); assert.equal(p.pets.filter(a=>a[4]==='cat').length,3);assert.equal(p.pets.filter(a=>a[4]==='dog').length,3);
  for(const a of p.animals)assert.ok(contains(p.pens[a[5]],a[1],a[2]));
});
test('37 named equipment entries and no accidentally repeated station coordinates',()=>{
  assert.equal(p.equipment.length,37);assert.equal(new Set(p.equipment.map(e=>e.slice(2,5).join(','))).size,37);
});
test('all coordinates remain within the altar construction cube',()=>{
  for(const n of p.npcs)for(const value of n.slice(3,9))assert.ok(Math.abs(value)<=80);
  for(const a of [...p.animals,...p.pets])for(const value of a.slice(1,4))assert.ok(Math.abs(value)<=80);
  for(const e of p.equipment)for(const value of e.slice(2,5))assert.ok(Math.abs(value)<=80);
});
test('all local scripts, styles, textures and MIT attribution are present; no runtime CDN',()=>{
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  for(const [,asset] of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!asset.startsWith('https:'))assert.ok(fs.existsSync(path.join(__dirname,asset)),asset);
  assert.ok(fs.readFileSync(path.join(__dirname,'vendor','THREE-LICENSE.txt'),'utf8').includes('MIT License'));
  assert.ok(!/<script[^>]+src="https?:/.test(html));
  for(const m of p.materials){const id={glow:'plaster',bamboo:'wood',sand:'soil'}[m[0]]||m[0];assert.ok(fs.existsSync(path.join(__dirname,'assets','textures',id+'-color.jpg')));}
});
