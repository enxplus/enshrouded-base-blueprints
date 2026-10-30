'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),T=require('./vendor/three.min.js');
const context={window:{}};for(const file of ['plan.js','reference-layout.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context);const p=context.window.CASTLE_PLAN;
const inside=(r,x,y)=>x>r.x-r.w/2+.001&&x<r.x+r.w/2-.001&&y>r.y-r.d/2+.001&&y<r.y+r.d/2-.001;
const overlap=(a,b)=>Math.abs(a.x-b.x)<(a.w+b.w)/2-.001&&Math.abs(a.y-b.y)<(a.d+b.d)/2-.001;
const eaves=r=>({...r,w:r.w+r.eave*2,d:r.d+r.eave*2});
test('exactly three separate full-length wings with detached roof envelopes',()=>{
  assert.equal(p.wings.length,3);for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(!overlap(eaves(p.wings[i]),eaves(p.wings[j])),p.wings[i].name+' / '+p.wings[j].name);
  assert.equal(p.wings[0].d,40);assert.equal(p.wings[1].d,40);assert.equal(p.wings[2].w,40);
});
test('24 small individual cottages in two rows, including non-touching eaves',()=>{
  assert.equal(p.cottages.length,24);assert.equal(new Set(p.cottages.map(c=>c.y)).size,2);
  for(let i=0;i<24;i++)for(let j=i+1;j<24;j++)assert.ok(!overlap(eaves(p.cottages[i]),eaves(p.cottages[j])));
  for(const n of p.npcs.slice(22))assert.ok(p.cottages.some(c=>inside(c,n[6],n[7])),n[1]+' bed');
});
test('eight northern curved terraces rise from +2 m to +12.5 m',()=>{
  assert.equal(p.terraces.length,8);assert.equal(p.terraces[0].h,2);assert.equal(p.terraces[7].h,12.5);
  for(let i=1;i<8;i++){assert.ok(p.terraces[i].h>p.terraces[i-1].h);assert.ok(p.terraces[i].front>p.terraces[i-1].front);}
});
test('western forest has real graduated root elevations matching the terrain',()=>{
  assert.ok(new Set(p.forest.map(f=>f.h)).size>=12);assert.ok(Math.max(...p.forest.map(f=>f.h))-Math.min(...p.forest.map(f=>f.h))>=12);
  for(const f of p.forest.filter(f=>f.y<75))assert.ok(Math.abs(f.h-Math.min(12.5,.5+(f.y+66)/135*12))<1e-6);
});
test('ten individual rice basins have half-meter water depth and stay outside buildings',()=>{
  assert.equal(p.paddies.length,10);for(const q of p.paddies){assert.equal(q.water-q.bottom,.5);for(const w of [...p.wings,...p.cottages])assert.ok(!overlap(q,w),q.id+' / '+w.name);}
});
test('central island and pond have irregular shorelines and four cardinal bridges',()=>{
  assert.ok(p.court.outer.length>12);assert.ok(p.court.inner.length>10);assert.equal(p.court.bridges.length,4);
  assert.ok(Math.max(...p.court.outer.map(v=>v[0]))-Math.min(...p.court.outer.map(v=>v[0]))>=40);
});
test('surface creek and drainage avoid wings, platform, cottages and rice basin interiors',()=>{
  for(const [points,width] of [[p.water.creek,p.water.creekWidth],[p.water.drainage,p.water.drainageWidth]]){
    const curve=new T.CatmullRomCurve3(points.map(([x,y,h])=>new T.Vector3(x,h,-y)),false,'centripetal',.5);
    for(let i=0;i<=500;i++){const v=curve.getPoint(i/500),t=curve.getTangent(i/500),n=new T.Vector3(-t.z,0,t.x).normalize();for(const sign of [-1,0,1]){const x=v.x+n.x*sign*width/2,y=-v.z-n.z*sign*width/2;for(const r of [...p.wings,p.castle.platform,...p.cottages,...p.paddies])assert.ok(!inside(r,x,y),'water enters '+r.name+' at '+x.toFixed(2)+','+y.toFixed(2));}}
  }
});
test('ground polygon operations and reference scene helpers are present locally',()=>{
  assert.ok(fs.statSync(path.join(__dirname,'vendor','polygon-clipping.min.js')).size>1000);assert.ok(fs.readFileSync(path.join(__dirname,'vendor','POLYGON-CLIPPING-LICENSE.txt'),'utf8').includes('MIT'));
  for(const file of ['reference-layout.js','reference-scene.js','reference-buildings.js'])assert.ok(fs.existsSync(path.join(__dirname,file)));
});
