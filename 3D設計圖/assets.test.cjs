'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const root=__dirname;
const sources=JSON.parse(fs.readFileSync(path.join(root,'assets','material-sources.json'),'utf8'));
function jpegDimensions(data){
  assert.equal(data.readUInt16BE(0),0xffd8);
  let i=2;
  while(i<data.length){
    while(data[i]===0xff)i++;
    const marker=data[i++];
    if(marker===0xd9||marker===0xda)break;
    const length=data.readUInt16BE(i);
    if([0xc0,0xc1,0xc2].includes(marker))return [data.readUInt16BE(i+5),data.readUInt16BE(i+3)];
    i+=length;
  }
  throw new Error('Missing JPEG frame header');
}
test('all seven PBR sources have an explicit CC0 license and original source link',()=>{
  assert.equal(sources.length,7);
  assert.equal(new Set(sources.map(s=>s.material)).size,7);
  for(const s of sources){assert.equal(s.license,'CC0-1.0');assert.ok(s.source.startsWith('https://ambientcg.com/a/'));assert.equal(s.licenseUrl,'https://docs.ambientcg.com/license/');assert.ok(s.author.includes('ambientCG'));}
});
test('21 local color, OpenGL normal and roughness maps are all true 1K JPEGs',()=>{
  for(const s of sources)for(const kind of ['color','normal','roughness']){
    const data=fs.readFileSync(path.join(root,s.files[kind].path));assert.deepEqual(jpegDimensions(data),[1024,1024],s.material+' '+kind);assert.equal(data.length,s.files[kind].bytes);
  }
});
test('all downloaded texture maps match their recorded SHA-256 checksums',()=>{
  for(const s of sources)for(const f of Object.values(s.files)){const data=fs.readFileSync(path.join(root,f.path));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),f.sha256);}
});
test('offline embedded data URLs exactly match the licensed JPG files',()=>{
  const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets','texture-data.js'),'utf8'),sandbox);
  for(const s of sources)for(const [kind,f] of Object.entries(s.files)){
    const uri=sandbox.window.ATLAS_TEXTURES[s.material][kind];assert.ok(uri.startsWith('data:image/jpeg;base64,'));assert.ok(Buffer.from(uri.split(',')[1],'base64').equals(fs.readFileSync(path.join(root,f.path))));
  }
});
test('the cinematic renderer is fully local and all Three.js additions retain MIT attribution',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const [,src] of html.matchAll(/<script[^>]+src="([^"]+)"/g)){assert.ok(!/^https?:/.test(src));assert.ok(fs.existsSync(path.join(root,src)),src);}
  for(const name of ['Sky','EffectComposer','RenderPass','ShaderPass','UnrealBloomPass','FXAAShader','GammaCorrectionShader'])assert.ok(fs.statSync(path.join(root,'vendor',name+'.js')).size>100);
  assert.ok(fs.readFileSync(path.join(root,'vendor','THREE-LICENSE.txt'),'utf8').includes('MIT License'));
  assert.ok(fs.readFileSync(path.join(root,'assets','CC0-MATERIALS.txt'),'utf8').includes('No Keen Games'));
});
