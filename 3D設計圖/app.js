'use strict';
(() => {
  const P = window.CASTLE_PLAN, T = window.THREE;
  const $ = id => document.getElementById(id);
  if (!P || !T || !T.OrbitControls || !T.EffectComposer || !T.UnrealBloomPass || !T.Sky || !window.AtlasVisuals || !window.ATLAS_TEXTURES || !window.ReferenceScene || !window.ReferenceBuildings || !window.polygonClipping || !P.referenceRevision) { $('loading').textContent = '本機元件或材質載入失敗，請確認所有元件與素材資料夾已完整複製。'; return; }
  const viewport = $('viewport'), initialDetail = $('detail').innerHTML;
  let renderer;
  try { renderer = new T.WebGLRenderer({antialias:true, preserveDrawingBuffer:true}); }
  catch (_) { $('loading').textContent = '無法啟動 WebGL；請使用啟用硬體加速的 Chrome / Edge。'; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.localClippingEnabled = true;
  viewport.appendChild(renderer.domElement);
  const scene = new T.Scene(); scene.background = new T.Color('#263b43');
  const perspectiveCamera=new T.PerspectiveCamera(43,1,.1,1000),mapCamera=new T.OrthographicCamera(-85,85,85,-85,.1,1000);
  let camera=perspectiveCamera,mapSpan=170;
  const controls = new T.OrbitControls(camera,renderer.domElement);
  controls.maxDistance=440; controls.minDistance=7; controls.maxPolarAngle=Math.PI*.495;
  controls.enableDamping=true;controls.dampingFactor=.075;controls.autoRotateSpeed=.3;
  const cutPlane = new T.Plane(new T.Vector3(0,-1,0),56);
  const materials = {}, geometries = new Map(), objects = [], groups = [];
  const categoryNames={structure:'建築結構',equipment:'設備與展示',npc:'NPC 駐點',bed:'專屬床位',animal:'農場動物',pet:'貓狗寵物',water:'給排水系',landscape:'農田與庭園',storage:'儲物箱陣',route:'橋樑與樓梯'};
  const categoryState = Object.fromEntries(Object.keys(categoryNames).map(k=>[k,true]));
  let selected=null, dirty=true, view='overview',refreshQueued=false;
  function requestRender(){dirty=true;if(document.hidden&&!refreshQueued){refreshQueued=true;queueMicrotask(()=>{refreshQueued=false;if(window.castleAtlas?.ready){FX.render();dirty=false;}});}}
  const FX=window.AtlasVisuals.create({renderer,scene,camera,plane:cutPlane,onDirty:requestRender});
  P.materials.forEach(([id])=>{materials[id]=FX.material(id);});
  function mat(color,opacity=1){const key=color+opacity;if(!materials[key])materials[key]=new T.MeshStandardMaterial({color:new T.Color(color).convertSRGBToLinear(),envMapIntensity:.08,roughness:.8,transparent:opacity<1,opacity,clippingPlanes:[cutPlane],clipShadows:true});return materials[key];}
  const M={rock:materials.rock,soil:materials.soil,sand:materials.sand,bamboo:materials.bamboo,wood:materials.wood,stone:materials.stone,white:materials.plaster,roof:materials.roof,gold:mat('#cda75d'),red:mat('#783627'),water:FX.water,grass:FX.material('grass'),leaf:mat('#526b3b'),pink:mat('#c99e9c'),npc:mat('#bfa978'),bed:mat('#698984'),metal:mat('#626e70')};
  M.gold.metalness=.65;M.gold.roughness=.4;M.metal.metalness=.65;M.metal.roughness=.42;
  const boxGeo=new T.BoxGeometry(1,1,1);
  function box(g,x,y,h,w,d,height,m=M.wood,kind='solid'){
    const mesh=new T.Mesh(boxGeo,m);mesh.position.set(x,h+height/2,-y);mesh.scale.set(w,height,d);mesh.userData.kind=kind;g.add(mesh);return mesh;
  }
  function cylinder(g,x,y,h,r,height,m=M.wood,vertices=10,top=r){
    const key=[r,height,vertices,top].join(':');if(!geometries.has(key))geometries.set(key,new T.CylinderGeometry(top,r,height,vertices));
    const mesh=new T.Mesh(geometries.get(key),m);mesh.position.set(x,h+height/2,-y);g.add(mesh);return mesh;
  }
  function ball(g,x,y,h,r,m){
    const foliage=m===M.leaf||m===M.pink,key=foliage?'canopy':'sphere';
    if(!geometries.has(key)){const geo=new T.SphereGeometry(1,20,14);if(foliage){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const n=1+Math.sin(p.getX(i)*18+p.getY(i)*11)*Math.cos(p.getZ(i)*17)*.12;p.setXYZ(i,p.getX(i)*n,p.getY(i)*n,p.getZ(i)*n);}geo.computeVertexNormals();}geometries.set(key,geo);}
    const mesh=new T.Mesh(geometries.get(key),m);mesh.scale.setScalar(r);mesh.position.set(x,h,-y);g.add(mesh);return mesh;
  }
  function item(name,x,y,h,w,d,category,region,description='',wiki='',floor=h){
    const g=new T.Group();const meta={id:'item-'+objects.length,name,x,y,h,w,d,category,region,description,wiki,floor,group:g};g.userData.meta=meta;scene.add(g);objects.push(meta);groups.push(g);return g;
  }
  const G=window.ReferenceScene.create({P,M,plane:cutPlane,fx:FX,item,box,cylinder,fixture});
  function label(text,x,y,h,w=18){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#15252de0';ctx.fillRect(1,1,510,94);ctx.strokeStyle='#c6aa73';ctx.lineWidth=3;ctx.strokeRect(2,2,508,92);ctx.font='600 29px Microsoft JhengHei, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f0e4cf';ctx.fillText(text,256,48,490);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:false,depthWrite:false}));s.position.set(x,h,-y);s.scale.set(w,w*96/512,1);s.renderOrder=10;return s;}
  const regionLabels=new T.Group();scene.add(regionLabels);
  P.regions.forEach(r=>{const height=r.id==='castle'?55:r.id==='water'?15:10;regionLabels.add(label(r.name,r.x,r.y,height,r.id==='workshops'?26:23));const option=document.createElement('option');option.value=r.id;option.textContent=r.name;$('region').appendChild(option);});
  function roof(g,x,y,h,w,d,next=0,rise=4,eave=1.8){
    const ow=w/2+eave,od=d/2+eave,iw=next?next/2:(w>=d?w*.28:0),id=next?Math.min(next,d)/2:(d>w?d*.28:0);
    const outer=[[-ow,-od],[ow,-od],[ow,od],[-ow,od]],inner=[[-iw,-id],[iw,-id],[iw,id],[-iw,id]],positions=[],uv=[];
    function point(side,u,t){const j=(side+1)%4,a=outer[side],b=outer[j],c=inner[side],e=inner[j],ax=a[0]+(b[0]-a[0])*u,az=a[1]+(b[1]-a[1])*u,bx=c[0]+(e[0]-c[0])*u,bz=c[1]+(e[1]-c[1])*u;return new T.Vector3(x+ax+(bx-ax)*t,h+rise*Math.pow(t,.78)+.52*Math.pow(1-t,12)+.42*Math.pow(Math.abs(u*2-1),6)*Math.pow(1-t,4),-y+az+(bz-az)*t);}
    for(let side=0;side<4;side++)for(let row=0;row<10;row++)for(let col=0;col<12;col++){
      const a=point(side,col/12,row/10),b=point(side,(col+1)/12,row/10),c=point(side,(col+1)/12,(row+1)/10),d=point(side,col/12,(row+1)/10);
      for(const p of [a,b,c,a,c,d]){positions.push(p.x,p.y,p.z);uv.push(p.x*.35,p.z*.35);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();const mesh=new T.Mesh(geo,M.roof);mesh.userData.kind='roof';g.add(mesh);
    for(let side=0;side<4;side++){
      const count=Math.ceil(side%2===0?(ow*2):od*2);
      for(let i=0;i<=count;i++){const p=point(side,i/count,0),q=point(side,i/count,.17),dir=q.clone().sub(p);const tile=new T.Mesh(new T.CylinderGeometry(.14,.14,dir.length(),8,1,true,0,Math.PI),M.roof);tile.position.copy(p.clone().add(q).multiplyScalar(.5));tile.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());tile.userData.kind='roof';g.add(tile);}
    }
    for(const sy of [-1,1])box(g,x,y+sy*(d/2+.45),h-.12,w+Math.min(1.4,eave*2),.35,.35,M.wood,'roof');
    if(!next){box(g,x,y,h+rise-.28,iw?iw*2+.7:.45,id?id*2+.7:.45,.28,M.roof,'roof');if(h>=40)for(const s of [-1,1]){const fin=ball(g,x+s*(iw||.35),y,h+rise-.3,.32,M.gold);fin.scale.multiply(new T.Vector3(.6,.9,.6));fin.userData.kind='roof';}}
  }
  function walls(g,x,y,h,w,d,height=3.7,passage=false,wallMat=M.white,sideDoors=false){
    for(const side of [-1,1]){
      if(sideDoors){for(const dir of [-1,1])box(g,x+side*w/2,y+dir*(d/4+1),h,.35,(d-4)/2,height,wallMat,'wall');box(g,x+side*w/2,y,h+2.7,.35,4,height-2.7,wallMat,'wall');for(const dir of [-1,1])box(g,x+side*w/2,y+dir*2,h,.4,.15,height,M.wood,'wall');}else box(g,x+side*w/2,y,h,.35,d,height,wallMat,'wall');
      const opening=passage?4:Math.min(3,w/3),segment=(w-opening)/2;
      box(g,x-(opening+segment)/2,y+side*d/2,h,segment,.35,height,wallMat,'wall');box(g,x+(opening+segment)/2,y+side*d/2,h,segment,.35,height,wallMat,'wall');
      box(g,x,y+side*d/2,h+2.7,opening,.35,height-2.7,wallMat,'wall');
      for(let a=-w/2;a<=w/2;a+=4)if(Math.abs(a)>=opening/2)box(g,x+a,y+side*d/2,h,.22,.5,height,M.wood,'wall');
      for(let a=-d/2;a<=d/2;a+=4){if(!sideDoors||Math.abs(a)>=2)box(g,x+side*w/2,y+a,h,.5,.22,height,M.wood,'wall');if(a<d/2-3&&(!sideDoors||Math.abs(a+2)>3)){box(g,x+side*(w/2+.03),y+a+2,h+1,.38,1.9,1.6,materials.glow,'wall');for(let k=0;k<4;k++)box(g,x+side*(w/2+.25),y+a+1.1+k*.6,h+1,.08,.045,1.6,M.wood,'wall');for(let k=0;k<4;k++)box(g,x+side*(w/2+.25),y+a+2,h+1+k*.5,.08,1.95,.045,M.wood,'wall');}}
    }
    for(const sx of [-1,1])for(const sy of [-1,1])box(g,x+sx*w/2,y+sy*d/2,h,.5,.5,height,M.wood,'wall');
  }
  function tree(g,x,y,h,height=7,pink=false,bamboo=false){return G.tree(g,x,y,h,height,pink?'cherry':bamboo?'bamboo':'broadleaf',Math.abs(Math.round(x*11+y*7)));}
  function batteredStone(g,x,y,h,w,d,height,topWidth){const geo=new T.BoxGeometry(w,height,d),p=geo.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0)p.setX(i,p.getX(i)*topWidth/w);geo.computeVertexNormals();const mesh=new T.Mesh(geo,M.stone);mesh.position.set(x,h+height/2,-y);g.add(mesh);return mesh;}
  function lantern(g,x,y,h=0){cylinder(g,x,y,h,.4,.25,M.stone,8);box(g,x,y,h+.25,.24,.24,1.15,M.stone);box(g,x,y,h+1.4,.75,.75,.12,M.wood);box(g,x,y,h+1.52,.58,.58,.62,materials.glow);for(const sx of [-1,1])for(const sy of [-1,1])box(g,x+sx*.3,y+sy*.3,h+1.5,.055,.055,.7,M.wood);const cap=new T.Mesh(new T.ConeGeometry(.66,.45,4),M.roof);cap.position.set(x,h+2.37,-y);cap.rotation.y=Math.PI/4;g.add(cap);}
  function building(name,x,y,h,w,d,region,height=4,withRoof=true,description=''){
    const g=item(name,x,y,h,w,d,'structure',region,description,'Building_Materials',h);
    box(g,x,y,h-.35,w,d,.35,M.wood,'floor');walls(g,x,y,h,w,d,height-.3);if(withRoof)roof(g,x,y,h+height,w,d,0,2);return g;
  }
  function stair(name,x,y,h,rise,region,width=1.5){
    const g=item(name,x,y,h,width*2+1,4,'route',region,'折返梯示意；每級升高 0.5 m、踏面 0.5 m。實際施工須保留淨空與樓板開口。','Building_Materials',h);
    const n=Math.round(rise/.5),half=Math.ceil(n/2);
    for(let i=0;i<n;i++){const right=i>=half;const yy=y+(right?(n-i-1):i)*.5;box(g,x+(right?width/2+.2:-width/2-.2),yy,h,width,.5,(i+1)*.5,M.wood);}
    box(g,x,y+half*.5,h+half*.5,width*2+.5,.8,.25,M.wood);return g;
  }
  function fixture(name,wiki,x,y,h,region,type='table',category='equipment',description='設備占地為示意，非遊戲模型或碰撞盒。',floor=h){
    const g=item(name,x,y,h,type==='bed'?2:2.2,type==='bed'?3:1.6,category,region,description,wiki,floor);
    if(type==='bed'){box(g,x,y,h,2,3,.45,M.wood);box(g,x,y,h+.45,1.8,2.8,.3,M.bed);box(g,x,y+1,h+.75,1.5,.6,.2,M.white);box(g,x,y+1.5,h,2,.2,1.3,M.wood);}
    else if(type==='chest'){box(g,x,y,h,1.1,.9,.75,M.wood);box(g,x,y,h+.75,1.15,.95,.18,M.metal);box(g,x,y-.48,h+.35,.22,.08,.28,M.gold);}
    else if(type==='kiln'){cylinder(g,x,y,h,1,2.4,M.stone,10,.8);box(g,x,y-.85,h+.25,.8,.25,.9,mat('#ef9750'));cylinder(g,x,y,h+2.4,.25,1,M.stone);}
    else if(type==='barrel'){cylinder(g,x,y,h,.7,1.3,M.wood);cylinder(g,x,y,h+1.25,.72,.12,M.metal);}
    else if(type==='wheel'){const wheel=cylinder(g,x,y,h,.9,.25,M.stone,16);wheel.rotation.z=Math.PI/2;wheel.position.y=h+1.1;box(g,x,y,h,1.6,1,.6,M.wood);}
    else if(type==='rack'||type==='door'){for(const s of [-1,1])box(g,x+s*.9,y,h,.16,.35,2.5,M.wood);box(g,x,y,h+2.3,2,.4,.2,M.wood);box(g,x,y,h+.6,2,.8,.15,M.wood);box(g,x,y,h+1.4,1.5,.16,.6,type==='door'?M.stone:M.metal);}
    else if(type==='mannequin'){box(g,x,y,h,1.6,1.2,.3,M.stone);cylinder(g,x,y,h+.3,.5,1.4,M.metal,8,.7);ball(g,x,y,h+2.05,.35,M.gold);for(const s of [-1,1])box(g,x+s*.5,y,h+.7,.3,.35,1.1,M.metal);}
    else if(type==='shield'){const s=ball(g,x,y,h+1.3,.8,M.metal);s.scale.set(.8,.9,.2);box(g,x,y,h,.25,.25,1.3,M.wood);}
    else if(type==='chair'){box(g,x,y,h+.5,1.4,1.4,.25,M.gold);box(g,x,y+.6,h+.5,1.4,.2,1.5,M.wood);for(const a of [-.5,.5])box(g,x+a,y,h,.15,1.1,.5,M.wood);}
    else if(type==='bath'){box(g,x,y,h,2,2.5,.7,M.stone);box(g,x,y,h+.7,1.7,2.2,.05,M.water);}
    else {box(g,x,y,h+1,2.2,1.6,.25,M.wood);for(const a of [-.85,.85])for(const b of [-.55,.55])box(g,x+a,y+b,h,.18,.18,1,M.wood);box(g,x,y,h+1.25,.7,.6,.5,M.metal);}
    return g;
  }
  const terrain=G.baseTerrain();
  const {island}=G.buildCourt();
  const altar=item('烈焰祭壇 Lv.4',0,0,0,4,4,'equipment','court','基地座標原點；建造邊界三軸 ±80 m。','Flame_Altar',0);box(altar,0,0,0,4,4,.4,M.stone);cylinder(altar,0,0,.4,1.1,.8,M.stone);FX.fire(altar,0,1.4,0,1);
  const vault=item('B1 · 地下魔法箱金庫',0,0,-4,16,16,'structure','court','內部 12×12 m，外牆厚 2 m。36 箱分三區；四柱與西南折返梯分離。','Storage',-4);
  box(vault,0,0,-4.4,16,16,.4,M.stone,'floor');
  for(const s of [-1,1]){box(vault,s*7,0,-4,2,16,3.6,M.stone,'wall');box(vault,0,s*7,-4,12,2,3.6,M.stone,'wall');}
  for(const a of [-1,1])for(const b of [-1,1])box(vault,a*1.2,b*1.2,-4,.5,.5,3.6,M.stone);
  for(const [qx,qy,n] of [[-1,1,'建材與礦石'],[1,1,'農產與食材'],[1,-1,'鍊金與戰利品']])for(let r=0;r<3;r++)for(let c=0;c<4;c++)fixture(n+'魔法箱 '+(r*4+c+1),'Storage',qx*(2+c*.95),qy*(2+r*1.15),-4,'court','chest','storage','72 格巨大魔法箱；箱間走道與互動距離需遊戲內確認。',-4);
  stair('B1 金庫折返梯',-3.5,-5,-4,4,'court',1);
  window.ReferenceBuildings.build({T,P,G,M,FX,item,box,roof,walls,stair,fixture,building,lantern,objects});
  function creature(name,x,y,h,type,region,category){
    const size=type==='yak'?2.8:type==='deer'?1.6:category==='pet'?.8:1.15;
    const g=item(name,x,y,h,size*1.7,size,category,region,category==='animal'?'每種動物一個示意標記；不代表實際飼養數量。':'六隻寵物中的一個固定駐點；不猜測毛色與姓名對應。',category==='pet'?'Pets':'Farm_Animals',h);
    const body=ball(g,x,y,h+size*.75,size*.55,type==='armadillo'?M.stone:type==='yak'?M.wood:type==='cat'?mat('#726e6b'):mat('#c5bba0'));body.scale.z*=1.4;
    ball(g,x,y-size*.75,h+size*.95,size*.3,M.wood);
    if(type==='bird'){cylinder(g,x,y,h,.08,size*.6,M.gold);const wing=ball(g,x,y,h+size*.8,size*.6,M.red);wing.scale.y=.15;}
    else for(const a of [-1,1])for(const b of [-1,1])cylinder(g,x+a*size*.3,y+b*size*.4,h,.08*size,size*.5,M.wood);
    const horn=mat('#b3a38a'),eyes=mat('#252923');
    for(const side of [-1,1])ball(g,x+side*size*.16,y-size*.98,h+size*1.02,size*.035,eyes);
    if(['goat','deer','rabbit','cat','dog'].includes(type))for(const a of [-1,1]){const ear=cylinder(g,x+a*size*.2,y-size*.75,h+size*1.15,.07*size,type==='deer'?.65:type==='rabbit'?.48:.3,type==='deer'||type==='goat'?horn:M.wood,6,0);ear.rotation.z=a*.22;if(type==='deer'){const branch=cylinder(g,x+a*size*.25,y-size*.75,h+size*1.4,.035,.36,horn,6,0);branch.rotation.z=a*.65;}}
    if(type==='rabbit')ball(g,x,y+size*.65,h+size*.7,size*.13,M.white);
    else if(type!=='capybara'&&type!=='bird'){const tail=cylinder(g,x,y+size*.65,h+size*.7,.05*size,size*(['goat','deer'].includes(type)?.22:.5),M.wood,6,0);tail.rotation.x=.7;}
    if(category==='pet')fixture(name+'專屬軟墊','Pets',x-2.5,y+1,h,region,'bed','pet','專屬休息軟墊示意。');
    else {const source=P.animals.find(a=>'動物：'+a[0]===name),slot=P.animals.filter(a=>a[5]===source[5]).indexOf(source);fixture(name+(type==='yak'?'大型軟墊':'小動物軟墊'),'Farm_Animals',44+slot*4,28-source[5]*16,h,region,'bed','equipment','軟墊配置於西側有頂木廄，尺寸為示意。');}
    return g;
  }
  P.animals.forEach(([name,x,y,h,type])=>creature('動物：'+name,x,y,h,type,'ranch','animal'));
  P.pets.forEach(([name,x,y,h,type,r])=>creature('寵物：'+name,x,y,h,type,r,'pet'));
  P.npcs.forEach(([role,name,wiki,x,y,h,bx,by,bh,region],i)=>{
    const g=item('NPC '+String(i+1).padStart(2,'0')+'：'+role,x,y,h,.8,.8,'npc',region,name+'；'+(i<16?'1F 工匠 / 助手，建議漫步半徑 2 m。':'固定駐點與專屬床位。')+' 床位 ('+bx+','+by+','+bh+')。',wiki,h);
    const cloth=mat(['#647653','#847257','#597577','#55694c','#857b61','#967b57','#817564','#526773','#677379','#615868','#7a6861','#775b68','#9a795d','#8b5545','#526f7d','#6d6a87'][i%16]),skin=mat('#b89779'),dark=mat('#35312b');
    for(const s of [-1,1]){box(g,x+s*.14,y-.04,h,.23,.38,.15,dark);cylinder(g,x+s*.14,y,h+.15,.105,.46,dark,8);const arm=cylinder(g,x+s*.35,y,h+.52,.085,.66,cloth,8);arm.rotation.z=s*.15;ball(g,x+s*.39,y,h+.57,.095,skin);}
    cylinder(g,x,y,h+.55,.27,.67,cloth,10,.34);ball(g,x,y,h+1.46,.28,skin);const hair=ball(g,x,y+.025,h+1.66,.3,dark);hair.scale.y*=.45;
    for(const s of [-1,1])ball(g,x+s*.095,y-.248,h+1.49,.026,dark);
    const ring=new T.Mesh(new T.RingGeometry(.6,.72,16),mat('#e9be63'));ring.rotation.x=-Math.PI/2;ring.position.set(x,h+.04,-y);g.add(ring);
    fixture(role+'床 · '+name,'Comfort',bx,by,bh,bh===4?'workshops':region,'bed','bed','對應 NPC '+String(i+1).padStart(2,'0')+'；床位座標為此 3D 版配置。可達性與床位認領需遊戲內確認。',bh);
  });
  for(const x of [-5,5])for(const y of [-42,-55,-69]){const g=item('參道石燈籠',x,y,0,1,1,'landscape','town','木框紙燈與石燈籠；月夜模式提供暖色發光。','Comfort',0);lantern(g,x,y);}
  for(const [x,y] of [[-6,6],[6,6]]){const g=item('御庭石燈籠',x,y,0,1,1,'landscape','court','石燈籠與迎賓庭園。','Comfort',0);lantern(g,x,y);}
  const environmentGroup=new T.Group();scene.add(environmentGroup);
  const landGeo=new T.PlaneGeometry(600,600,120,120);landGeo.rotateX(-Math.PI/2);const lp=landGeo.attributes.position;
  for(let i=0;i<lp.count;i++){const x=lp.getX(i),z=lp.getZ(i),dist=Math.max(Math.abs(x),Math.abs(z)),fade=Math.min(1,Math.max(0,(dist-80)/65));lp.setY(i,-.12+fade*(Math.sin(x*.025)*Math.cos(z*.017)*6.4+Math.max(0,dist-160)*.2));}
  const kept=[];for(let i=0;i<landGeo.index.count;i+=3){const a=landGeo.index.getX(i),b=landGeo.index.getX(i+1),c=landGeo.index.getX(i+2),x=(lp.getX(a)+lp.getX(b)+lp.getX(c))/3,z=(lp.getZ(a)+lp.getZ(b)+lp.getZ(c))/3;if(Math.abs(x)>=80||Math.abs(z)>=80)kept.push(a,b,c);}landGeo.setIndex(kept);landGeo.computeVertexNormals();environmentGroup.add(new T.Mesh(landGeo,M.grass));
  for(let i=0;i<44;i++){const angle=i*2.3999,r=108+(i%7)*7,x=Math.cos(angle)*r,y=Math.sin(angle)*r;tree(environmentGroup,x,y,-.5,7+(i%4)*1.4);}
  // Merge only within a selectable object and a visibility kind, preserving picking and layers.
  for(const g of [...groups,environmentGroup]){
    const batches=new Map();
    for(const mesh of [...g.children]){
      if(!mesh.isMesh||mesh.isInstancedMesh||mesh.userData.dynamic)continue;
      const kind=mesh.userData.kind||'solid',key=mesh.material.uuid+':'+kind;
      if(!batches.has(key))batches.set(key,{material:mesh.material,kind,meshes:[]});batches.get(key).meshes.push(mesh);
    }
    for(const batch of batches.values()){
      if(batch.meshes.length<2)continue;
      const arrays={position:[],normal:[],uv:[]};
      for(const mesh of batch.meshes){
        mesh.updateMatrix();const geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(mesh.matrix);
        for(const attr of Object.keys(arrays))arrays[attr].push(geo.getAttribute(attr).array);geo.dispose();g.remove(mesh);
      }
      const merged=new T.BufferGeometry();
      for(const [attr,parts] of Object.entries(arrays)){
        const data=new Float32Array(parts.reduce((n,a)=>n+a.length,0));let offset=0;for(const part of parts){data.set(part,offset);offset+=part.length;}
        merged.setAttribute(attr,new T.BufferAttribute(data,attr==='uv'?2:3));
      }
      merged.computeBoundingSphere();const mesh=new T.Mesh(merged,batch.material);mesh.userData.kind=batch.kind;g.add(mesh);
    }
  }
  scene.traverse(o=>{if(o.isMesh&&o!==FX.sky&&o.material!==M.water&&!o.userData.dynamic&&!o.userData.noShadow){o.castShadow=true;o.receiveShadow=true;}});
  const grid=new T.Group();scene.add(grid);
  const gridHelper=new T.GridHelper(160,40,'#ccb780','#7b9292');gridHelper.position.y=.11;gridHelper.material.transparent=true;gridHelper.material.opacity=.22;grid.add(gridHelper);
  const axes=new T.BufferGeometry().setFromPoints([new T.Vector3(-80,.18,0),new T.Vector3(80,.18,0),new T.Vector3(0,.18,80),new T.Vector3(0,.18,-80)]);grid.add(new T.LineSegments(axes,new T.LineBasicMaterial({color:'#dcc28b',transparent:true,opacity:.6})));
  for(let n=-80;n<=80;n+=20){grid.add(label('X '+(n>0?'+':'')+n,n,-79,.4,9));if(n!==-80)grid.add(label('Y '+(n>0?'+':'')+n,-77,n,.4,9));}
  const boundGeo=new T.EdgesGeometry(new T.BoxGeometry(160,160,160));const bounds=new T.LineSegments(boundGeo,new T.LineBasicMaterial({color:'#cda86d',transparent:true,opacity:.35}));scene.add(bounds);bounds.visible=false;
  const selectionLabel=label('',0,0,0,20);selectionLabel.visible=false;scene.add(selectionLabel);
  const selectionBox=new T.BoxHelper(new T.Object3D(),'#ffe3a1');selectionBox.visible=false;scene.add(selectionBox);
  function hasVisibleMesh(g){let found=false;g.traverse(c=>{if(c.isMesh&&c.visible)found=true;});return found;}
  function applyState(){
    const floor=$('floor').value,explode=$('explode').checked,region=$('region').value;
        $('cut').max=explode?'100':'56';if(Number($('cut').value)>Number($('cut').max))$('cut').value=$('cut').max;
        const limit=Number($('cut').value);
        cutPlane.constant=limit;$('cut-value').textContent=(limit>=0?'+':'')+limit+' m';
    for(const g of groups){const m=g.userData.meta;const isTerrain=g===terrain;g.visible=categoryState[m.category]&&(region==='all'||m.region===region)&&(floor==='all'||m.floor===Number(floor));
      if(isTerrain)g.visible=categoryState.landscape&&floor==='all';
      const offset=explode?Math.max(0,[0,4,8,16,24,32,40].indexOf(m.floor))*7:0;g.position.y=offset;
      g.traverse(c=>{if(!c.isMesh)return;const kind=c.userData.kind;c.visible=(kind!=='roof'||$('roofs').checked)&&(kind!=='wall'||$('walls').checked);});
      if(m.h+offset>limit+.01)g.visible=false;
    }
    regionLabels.visible=$('labels').checked&&floor==='all'&&!explode;
    regionLabels.children.forEach((s,i)=>{s.visible=region==='all'||P.regions[i].id===region;});
    grid.visible=$('grid').checked;grid.position.y=floor==='all'?0:Number(floor);bounds.visible=$('bounds').checked;
    environmentGroup.visible=categoryState.landscape&&floor==='all'&&!explode&&region==='all';
    FX.update(0);G.update();FX.shadows();
    if(selected&&selected.group.visible&&hasVisibleMesh(selected.group)){selectionBox.setFromObject(selected.group);selectionBox.visible=true;selectionLabel.visible=$('labels').checked;selectionLabel.position.set(selected.x,selected.h+selected.group.position.y+5,-selected.y);}else {selectionBox.visible=false;selectionLabel.visible=false;}
    $('mode-badge').textContent=(explode?'展開示意 / 非實際高程':floor==='all'?'全樓層 / Z ≤ '+limit+' m':$('floor').selectedOptions[0].textContent)+' · '+(region==='all'?'全基地':P.regions.find(r=>r.id===region).name);
    dirty=true;
  }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function select(m,focus=false){
    selected=m;const r=P.regions.find(r=>r.id===m.region);
    $('selection-card').hidden=false;$('selection-card').innerHTML='<strong>'+escapeHTML(m.name)+'</strong><small>X '+m.x+' / Y '+m.y+' / Z '+m.h+' m</small><button id="show-detail">查看施工規劃</button>';$('show-detail').addEventListener('click',()=>{if(document.body.classList.contains('immersive'))$('cinematic').click();});
    $('detail').innerHTML='<span class="tag">'+escapeHTML(categoryNames[m.category])+'</span><h3>'+escapeHTML(m.name)+'</h3><dl><dt>座標 m</dt><dd>X '+m.x+' / Y '+m.y+' / Z '+m.h+'</dd><dt>4 m 網格</dt><dd>'+m.x/4+' / '+m.y/4+' / '+m.h/4+'</dd><dt>占地示意</dt><dd>'+m.w+' × '+m.d+' m</dd><dt>區域</dt><dd>'+escapeHTML(r?.name||m.region)+'</dd></dl><p>'+escapeHTML(m.description)+'</p>'+(m.wiki?'<a target="_blank" rel="noopener" href="'+P.wiki+encodeURIComponent(m.wiki)+'">Wiki：'+escapeHTML(m.wiki.replace(/_/g,' '))+' ↗</a>':'');
    const old=selectionLabel.material.map;const replacement=label(m.name,0,0,0,Math.max(14,Math.min(28,m.name.length*.85)));selectionLabel.material.map=replacement.material.map;selectionLabel.material.needsUpdate=true;selectionLabel.scale.copy(replacement.scale);replacement.material.dispose();old.dispose();
    if(focus){useCamera(false);view='overview';$('region').value='all';$('floor').value=String(m.floor);if(![...$('floor').options].some(o=>o.value===String(m.floor)))$('floor').value='all';$('cut').value='56';$('explode').checked=false;categoryState[m.category]=true;document.querySelector('[data-layer="'+m.category+'"]').checked=true;if(['equipment','npc','bed','storage'].includes(m.category)){$('walls').checked=false;$('roofs').checked=false;}
      controls.target.set(m.x,m.h+1,-m.y);camera.position.set(m.x+Math.max(12,m.w),m.h+Math.max(14,m.w),-m.y+Math.max(15,m.d));controls.update();}
    applyState();
  }
  function useCamera(top){const next=top?mapCamera:perspectiveCamera;if(camera!==next){camera=next;controls.object=camera;FX.setCamera(camera);if(window.castleAtlas)window.castleAtlas.camera=camera;}}
  function setView(next='overview',regionId=$('region').value){
    if(regionId==='all'&&$('floor').value!=='all')regionId=Number($('floor').value)>=8?'castle':Number($('floor').value)===-4?'court':'workshops';
    useCamera(next==='top');view=next;const r=P.regions.find(r=>r.id===regionId)||{x:0,y:0,h:10,size:175};  const size=r.size*Math.max(1,1/camera.aspect)*1.2,targetH=$('floor').value==='all'?r.h:Number($('floor').value);controls.target.set(r.x,targetH,-r.y);
      if(next==='top'){mapSpan=regionId==='all'?170:r.size*1.06;mapCamera.zoom=1;resize();}
      const offsets={overview:[size*.7,size*.75,size*.9],top:[0,300,.01],south:[0,size*.16,size*1.5],east:[size*1.5,size*.16,0]};const v=offsets[next];camera.position.set(r.x+v[0],targetH+v[1],-r.y+v[2]);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===next));dirty=true;}
  Object.entries(categoryNames).forEach(([key,name])=>{const l=document.createElement('label');l.className='check';l.innerHTML='<input type="checkbox" checked data-layer="'+key+'">'+name;$('layers').appendChild(l);l.firstChild.addEventListener('change',e=>{categoryState[key]=e.target.checked;applyState();});});
  P.decisions.forEach(([title,text])=>{const div=document.createElement('div');div.className='decision';const strong=document.createElement('strong');strong.textContent=title;div.append(strong,document.createTextNode(text));$('decisions').appendChild(div);});
  P.materials.forEach(([id,name,wiki,color])=>{const row=document.createElement('div');row.className='material';row.innerHTML='<span class="swatch" style="background-color:'+color+';background-image:url(assets/textures/'+({glow:'plaster',bamboo:'wood',sand:'soil'}[id]||id)+'-color.jpg)"></span><a href="'+P.wiki+wiki+'" target="_blank" rel="noopener">'+name+' ↗</a>';$('materials').appendChild(row);});
  ['floor','cut','roofs','walls','explode','labels','grid','bounds'].forEach(id=>$(id).addEventListener('input',()=>{
    if(id==='explode'){$('cut').max=$('explode').checked?'100':'56';$('cut').value=$('cut').max;}
    if(id==='floor'&&$('floor').value!=='all'){$('roofs').checked=false;$('walls').checked=false;$('cut').value=$('explode').checked?'100':'56';setView('overview',Number($('floor').value)>=8?'castle':Number($('floor').value)===-4?'court':'workshops');}
    applyState();
  }));
  $('region').addEventListener('change',()=>{applyState();setView(view);});document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('reset').addEventListener('click',()=>{$('floor').value='all';$('region').value='all';$('cut').value='56';for(const id of ['roofs','walls'])$(id).checked=true;for(const id of ['explode','bounds','labels','grid'])$(id).checked=false;$('selection-card').hidden=true;$('coordinates').textContent='X 0 / Y 0 / Z 0 m';for(const k of Object.keys(categoryState))categoryState[k]=true;document.querySelectorAll('[data-layer]').forEach(c=>c.checked=true);selected=null;$('detail').innerHTML=initialDetail;$('search').value='';$('results').replaceChildren();selectionLabel.visible=false;selectionBox.visible=false;applyState();setView();});
  $('search').addEventListener('input',()=>{const q=$('search').value.trim().toLowerCase();$('results').replaceChildren();if(!q)return;const matches=objects.filter(m=>(m.name+' '+m.description).toLowerCase().includes(q));const summary=document.createElement('small');summary.textContent=matches.length+' 個符合項目'+(matches.length>30?'（顯示前 30 個）':'');$('results').appendChild(summary);matches.slice(0,30).forEach(m=>{const b=document.createElement('button');b.textContent=m.name;const s=document.createElement('small');s.textContent='('+m.x+', '+m.y+', '+m.h+') m';b.appendChild(s);b.addEventListener('click',()=>select(m,true));$('results').appendChild(b);});});
  const raycaster=new T.Raycaster(),mouse=new T.Vector2();let pointerStart=null;
  renderer.domElement.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5||e.button!==0)return;const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(groups,true);for(const hit of hits){if(!hit.object.visible||hit.point.y>cutPlane.constant)continue;let g=hit.object;while(g&&!g.userData.meta)g=g.parent;if(g&&g.visible){select(g.userData.meta);$('coordinates').textContent='X '+hit.point.x.toFixed(1)+' / Y '+(-hit.point.z).toFixed(1)+' / Z '+hit.point.y.toFixed(1)+' m';break;}}pointerStart=null;});
  $('capture').addEventListener('click',()=>{
    FX.render();
    renderer.domElement.toBlob(blob=>{
      if(!blob){$('capture').textContent='圖片產生失敗，請重試';return;}
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='霧鎖王國-3D施工圖.png';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    },'image/png');
  });
  (window.ATLAS_TEXTURE_SOURCES||[]).forEach(source=>{const a=document.createElement('a');a.href=source.source;a.target='_blank';a.rel='noopener';a.textContent=source.asset+' · ambientCG · CC0';$('texture-sources').appendChild(a);});
  $('lighting').addEventListener('change',()=>{FX.lighting($('lighting').value);dirty=true;});
  $('quality').addEventListener('change',()=>{FX.setQuality($('quality').value);resize();});
  $('effects').checked=!matchMedia('(prefers-reduced-motion: reduce)').matches;FX.setEnabled($('effects').checked);
  $('effects').addEventListener('change',()=>FX.setEnabled($('effects').checked));
  $('orbit').addEventListener('change',()=>{controls.autoRotate=$('orbit').checked;dirty=true;});
  function hero(){useCamera(false);view='overview';controls.target.set(0,10,-5);camera.position.set(66,145,202);controls.update();dirty=true;}
  $('hero').addEventListener('click',()=>{$('region').value='all';$('floor').value='all';applyState();hero();});$('all-view').addEventListener('click',()=>{$('region').value='all';$('floor').value='all';applyState();setView();});$('plan-view').addEventListener('click',()=>{$('region').value='all';$('floor').value='all';applyState();setView('top');});
  $('cinematic').addEventListener('click',()=>{const active=document.body.classList.toggle('immersive');$('cinematic').setAttribute('aria-pressed',String(active));$('cinematic').textContent=active?'顯示施工控制':'沉浸檢視';queueMicrotask(()=>{resize();setView(view);});});
  function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;perspectiveCamera.aspect=aspect;mapCamera.aspect=aspect;mapCamera.left=-mapSpan/2*Math.max(1,aspect);mapCamera.right=-mapCamera.left;mapCamera.top=mapSpan/2*Math.max(1,1/aspect);mapCamera.bottom=-mapCamera.top;perspectiveCamera.updateProjectionMatrix();mapCamera.updateProjectionMatrix();controls.maxDistance=Math.min(900,Math.max(440,440/aspect));FX.resize(w,h);dirty=true;}
  new ResizeObserver(resize).observe(viewport);window.addEventListener('resize',resize);controls.addEventListener('change',requestRender);
  let previous=0,rendered=0;
  function animate(now=0){requestAnimationFrame(animate);const dt=Math.min(.05,(now-previous)/1000||0);previous=now;if(document.hidden&&!dirty)return;controls.update();FX.update(dt);G.update();const budget=FX.quality==='high'?1000/30:FX.quality==='medium'?1000/24:1000/20;if((dirty&&(document.hidden||rendered===0))||((dirty||FX.enabled||controls.autoRotate)&&now-rendered>=budget)){FX.render();dirty=false;rendered=now;}}
  window.castleAtlas={objects,scene,camera,controls,renderer,select,applyState,plan:P,fx:FX,reference:G,ready:false};
  applyState();resize();hero();
  FX.ready().then(()=>{window.castleAtlas.ready=true;$('loading').remove();animate();}).catch(error=>{$('loading').textContent='本機材質載入失敗：'+error.message;console.error(error);});
})();
