'use strict';
window.ReferenceBuildings={build(ctx){
  const {T,P,G,M,FX,item,box,roof,walls,stair,fixture,building,lantern}=ctx;
  fixture('大型快速存放站','Storage',5,-6,0,'court');
  const shrine=item('本丸 · 手水舍',8,9,0,4,4,'structure','court','依圖 1 的小型有頂手水舍，與原點祭壇、迎賓松及地下階梯分開。','Improved_Water_Well',0);
  box(shrine,8,9,0,4,4,.18,M.stone);for(const sx of [-1,1])for(const sy of [-1,1])box(shrine,8+sx*1.6,9+sy*1.6,.18,.18,.18,2.6,M.wood);roof(shrine,8,9,2.8,4,4,0,1.3,.65);fixture('手水舍 · 高級水井','Improved_Water_Well',8,9,.18,'court','barrel');
  P.court.bridges.forEach(b=>{const g=item(b.name,b.x,b.y,0,b.w,b.d,'route','court','朱紅木橋跨越自然環池，不是正方形槽上的短踏板。','Building_Materials',0),north=b.d>b.w,n=20;for(let i=0;i<n;i++){const t=i/(n-1),along=(t-.5)*(north?b.d:b.w),h=.18+Math.sin(t*Math.PI)*.35,x=b.x+(north?0:along),y=b.y+(north?along:0);box(g,x,y,h,north?b.w:(b.w/n+.03),north?(b.d/n+.03):b.d,.18,M.red);for(const side of [-1,1])box(g,x+(north?side*b.w/2:0),y+(north?0:side*b.d/2),h,.1,.1,.9,M.red);}});
  P.wings.forEach(w=>{
    for(const h of [0,4]){const g=item(w.name+(h?' · 2F 閣樓':' · 1F 工坊'),w.x,w.y,h,w.w,w.d,'structure','workshops','以圖 1／12 為準，每翼獨立成棟；'+(h?'16 張工匠床位分配在三翼閣樓。':'內部按北南／東西分區，屋簷與另外兩翼不黏合。'),'Building_Materials',h);
      const ring=G.rounded(w.x,w.y,w.w,w.d,.03),hole=h===4?[[w.stairX-1.35,w.stairY-.4],[w.stairX+1.35,w.stairY-.4],[w.stairX+1.35,w.stairY+4.2],[w.stairX-1.35,w.stairY+4.2],[w.stairX-1.35,w.stairY-.4]]:null;G.surface(g,ring,h+.025,M.wood,hole?[hole]:[],'floor');walls(g,w.x,w.y,h,w.w,w.d,3.7,w.id==='south',M.white,w.id!=='south');
      if(w.id==='south'){for(const x of [-4,4]){box(g,x,-27,h,.18,6,3.7,M.wood,'wall');box(g,x,-34.5,h,.18,3,3.7,M.wood,'wall');}}
      else {for(const y of [-2,2]){box(g,w.x-4,y,h,6,.15,3.7,M.wood,'wall');box(g,w.x+4,y,h,6,.15,3.7,M.wood,'wall');}}
      if(h===4)roof(g,w.x,w.y,8,w.w,w.d,0,2,w.eave);
    }
    stair(w.name+'閣樓梯',w.stairX,w.stairY,0,4,'workshops',1);
  });
  const port=item('南翼 · 獨立前廊',0,-37.5,0,8,3,'route','workshops','南翼門廊向城下町開放；不連接東西翼。','Building_Materials',0);for(const x of [-3.5,3.5])box(port,x,-38.5,0,.2,.2,3,M.wood);roof(port,0,-37.5,3.2,8,3,0,.9,.7);
  for(const [name,wiki,x,y,h,r,type] of P.equipment)fixture(name,wiki,x,y,h,r,type);
  for(const x of [28,35]){const g=item('東翼南端 · 外排煙囪',x,-22,0,1,1,'structure','workshops','外排區移至東翼南端，避免穿過閣樓及牧場屋簷。','Blast_Furnace',0);box(g,x,-22,0,.8,.8,9.5,M.stone);FX.smoke(g,x,9.5,22);}
  const platform=item('北之丸 · 城郭白砂平台',0,50,0,48,44,'structure','castle','圖 1／12 的寬廣矩形本丸上層平台；台面 +4 m、南緣 Y28。','Rough_Stone_Block',0);box(platform,0,50,0,48,44,4,M.stone);G.surface(platform,G.rounded(0,50,47.6,43.6,.15),4.01,G.zenMaterial);
  for(const side of [-1,1]){box(platform,side*23.7,50,4,.5,44,1,M.stone);box(platform,0,72,4,48,.5,1,M.stone);box(platform,side*13,28,4,22,.5,1,M.stone);}
  const towerBase=item('北之丸 · 天守斜面石垣',0,54,4,40,36,'structure','castle','台面 +4 m 起築斜面石垣，天守 1F +8 m；正面階梯與西側小櫓有獨立避讓開口。','Rough_Stone_Block',0),baseRing=[[-20,36],[20,36],[20,72],[-20,72],[-20,36]],holes=[[[-2.3,35.5],[2.3,35.5],[2.3,38],[-2.3,38],[-2.3,35.5]]];
  for(const [x,y] of P.castle.turrets)holes.push([[x-3,y-3],[x+3,y-3],[x+3,y+3],[x-3,y+3],[x-3,y-3]]);
  const meshes=G.solid(towerBase,baseRing,4,8,M.rock,holes);for(const m of meshes){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getZ(i)>3.99){if(Math.abs(p.getX(i))>4)p.setX(i,p.getX(i)*.8);p.setY(i,54+(p.getY(i)-54)*32/36);}m.geometry.computeVertexNormals();}
  const entry=item('北之丸 · 上平台階梯',0,24,0,4,8,'route','castle','北橋 → +4 m 白砂平台 → +8 m 天守正門。','Building_Materials',0);for(let i=0;i<8;i++)box(entry,0,20.5+i,0,4,1,(i+1)*.5,M.stone);
  const inner=item('天守正門階梯',0,36,4,4,4,'route','castle','平台上再升四公尺，石垣預留階梯槽。','Building_Materials',0);for(let i=0;i<8;i++)box(inner,0,34.25+i*.5,4,4,.5,(i+1)*.5,M.stone);
  G.buildZen();
  P.castle.turrets.forEach(([x,y],i)=>{const g=item('北之丸 · 西側小櫓 '+(i+1),x,y,4,5,5,'structure','castle','依圖 12 的西側附屬小櫓輪廓重建，與主天守層次分開。','Building_Materials',0);box(g,x,y,4,5,5,.2,M.wood,'floor');walls(g,x,y,4.2,5,5,2.5);roof(g,x,y,6.8,5,5,0,1.6,.7);});
  P.castleFloors.forEach((f,i)=>{const g=item(f.name,0,54,f.h,f.w,f.w,'structure','castle','五重退縮天守位於大平台北端；保持 32／24／20／16／12 m 五層與 +52 m 最高點。','Building_Materials',f.h),ring=G.rounded(0,54,f.w,f.w,.03),hole=[[-2,52],[2,52],[2,56],[-2,56],[-2,52]];G.surface(g,ring,f.h+.025,M.wood,[hole],'floor');walls(g,0,54,f.h,f.w,f.w,4);roof(g,0,54,f.h+4,f.w,f.w,P.castleFloors[i+1]?.w||0,i===4?8:4);
    if(i<4)stair('天守 '+(i+1)+'F → '+(i+2)+'F 核心梯',0,52,f.h,8,'castle',1.4);else{stair('5F → +44 m 滑翔層樓梯',0,52,40,4,'castle',1.4);const deck=item('5F · +44 m 滑翔夾層渡廊',0,54,44,12,12,'route','castle','梯井與四面滑翔台；屋簷出口須保留頭部淨空。','Building_Materials',40);G.surface(deck,ring,44,M.wood,[hole],'floor');}
    f.items.forEach(([name,x,y,type])=>fixture(name,name==='秘密石門'?'Secret_Stone_Door':name==='城主大床'?'Comfort':'Furniture',x,y,f.h,'castle',type));});
  for(const [name,x,y,w,d] of [['北向滑翔台',0,64,4,8],['南向滑翔台',0,44,4,8],['西向滑翔台',-10,54,8,4],['東向滑翔台',10,54,8,4]]){const g=item(name,x,y,44,w,d,'route','castle','四向滑翔台 +44 m。','Glider',40);box(g,x,y,43.7,w,d,.3,M.wood);}
  building('西之丸 · 育苗亭',P.nursery.x,P.nursery.y,0,P.nursery.w,P.nursery.d,'farm',4,true,'育苗亭放在旱田東側與西翼北端之間，保留八座育苗床。');
  for(let row=0;row<2;row++)for(let col=0;col<4;col++)fixture('育苗床 '+(row*4+col+1),'Seedbed',-37.45+col*2.3,28+row*5,0,'farm','table');
  fixture('土壤魔法箱','Storage',-34.5,35.7,0,'farm','chest','storage');fixture('幼苗木箱','Storage',-32,35.7,0,'farm','chest','storage');for(let i=0;i<3;i++)fixture('蜂箱 '+(i+1),'Honey_Beehive',-41,27+i*4,2,'farm','barrel');
  const ford=item('往旱田木橋',-41,0,0,6,4,'route','farm','從西翼外門跨過水渠，上接 +2 m 旱地。','Building_Materials',0);for(let i=0;i<12;i++)box(ford,-38.25-i*.5,0,i/11*2,.55,4,.18,M.wood);
  G.buildFarm();G.buildNortheast();
  building('東北 · 水車磨坊',47,54,4,8,8,'water',4,true,'圖 1／12 的岩潭東岸小磨坊，面向雙水車與溪流。');fixture('鍊金磨坊','Mill',45,53,4,'water','wheel');fixture('粉末魔法箱','Storage',49,51,4,'water','chest','storage');
  P.water.wheels.forEach(([x,y,h],i)=>{const g=item('雙聯水車 '+(i+1),x,y,h,1.5,5,'equipment','water','設於圓潭南側出口，旋轉為視覺動畫。','Mill',4);FX.wheel(g,x,h+2.5,-y);});
  const millwalk=item('東北 · 水車木橋',40,48,4,12,2,'route','water','連接兩水車與磨坊入口的木造棧橋。','Building_Materials',4);box(millwalk,40,48,4,12,2,.2,M.wood);
  const names=['山羊御廄','精靈鹿苑','巨獸犛牛御廄','珍禽與跳兔舍','水豚與犰狳欄'];P.pens.forEach((p,i)=>{const g=item(names[i],p.x,p.y,0,p.w,p.d,'structure','ranch','依圖 1 比例重排为 36×16 m，西 12 m 有頂木廄、東 24 m 草地；不擠壓三翼或溪流。','Farm_Animals',0);box(g,48,p.y,0,12,16,.15,M.wood);roof(g,48,p.y,4.5,12,16,0,2,.8);for(const x of [42,54])for(const side of [-1,1])box(g,x,p.y+side*8,0,.3,.3,4.5,M.wood);box(g,42,p.y,0,.25,16,4,M.white,'wall');for(const side of [-1,1]){box(g,60,p.y+side*8,0,36,.13,2,M.wood,'wall');for(let x=42;x<=78;x+=3)box(g,x,p.y+side*8,0,.15,.15,2.1,M.wood,'wall');}box(g,78,p.y,0,.15,16,2,M.wood,'wall');for(const side of [-1,1])box(g,54,p.y+side*5,0,.2,6,4,M.wood,'wall');fixture(names[i]+'餵食器','Farm_Animals',74,p.y,0,'ranch','table');});
  building('東之丸 · 牧夫番屋',61,45,0,8,8,'ranch',4,true,'放在五欄北側，不侵入溪谷磨坊或第一欄。');fixture('飼料魔法箱','Storage',58,47,0,'ranch','chest','storage');
  const capy=item('水豚親水淺池',73,-37,-.5,5,4,'water','ranch','以圓角池岸呈現親水設施。','Farm_Animals',0),cr=G.rounded(73,-37,5,4);G.solid(capy,cr,-.6,-.03,M.soil);G.surface(capy,cr,0,M.water);
  P.cottages.forEach(c=>{const g=item('南之丸 · 獨立町家 '+String(c.id).padStart(2,'0'),c.x,c.y,0,c.w,c.d,'structure','town','圖 1／12 的兩排分棟小町家；有間隙、独立屋脊與門前步道，不是兩座連棟長屋。','Building_Materials',0);box(g,c.x,c.y,-.2,c.w,c.d,.2,M.wood,'floor');walls(g,c.x,c.y,0,c.w,c.d,3.2,false,M.wood);roof(g,c.x,c.y,3.3,c.w,c.d,0,1.6+(c.id%3)*.18,c.eave);box(g,c.x,c.y-3.5,0,4,1,.16,M.wood);});
  for(const side of [-1,1]){fixture('茶屋座席','Comfort',side*28,-51,0,'town','chair');fixture('圍爐裏','Comfort',side*28,-65,0,'town','kiln');}
  const street=item('南之丸 · 櫻並木參道',0,-52,0,8,40,'route','town','穿堂與大手門之間為中央參道；兩排小町家各有横向前巷。','Building_Materials',0);box(street,0,-52,.015,8,40,.05,M.sand);for(const y of [-45.5,-59])box(street,0,y,.015,120,3,.04,M.sand);
  for(const side of [-1,1])for(const x of [10,20,30,40,50,60]){const g=item('南之丸 · 櫻並木',side*x,-43.5,0,4,4,'landscape','town','町家前的櫻樹與人行步道。','Comfort',0);G.tree(g,side*x,-43.5,0,5.5,'cherry',1000+x*side);}
  for(const x of [-6,6])for(const y of [-52,-62]){const g=item('南之丸 · 參道櫻樹',x,y,0,4,4,'landscape','town','中央參道兩側的櫻樹。','Comfort',0);G.tree(g,x,y,0,5.2,'cherry',1200+x+y);}
  building('大手門城門櫓',0,-70,0,12,4,'town',6,true,'大手門與朱紅太鼓橋對位，門洞保持四公尺通道。');
  const gate=ctx.objects[ctx.objects.length-1].group;gate.children.filter(c=>c.userData.kind==='floor').forEach(c=>gate.remove(c));
  const moat=item('外濠護城河',0,-74,-2,160,4,'water','town','南邊界四公尺外濠，尾水從西側曲渠匯入。','Water',0);box(moat,0,-74,-2.2,160,4,.2,M.rock);box(moat,0,-74,-.09,160,4,.08,M.water);
  const bridge=item('大手門 · 朱紅太鼓橋',0,-74,0,4,8,'route','town','紅色弧橋跨越南側外濠。','Building_Materials',0);for(let i=0;i<20;i++){const y=-78+i*8/19,h=Math.sin(i/19*Math.PI)*1.1;box(bridge,0,y,h,4,.45,.18,M.red);for(const x of [-2,2])box(bridge,x,y,h,.1,.1,1,M.red);}
}};
