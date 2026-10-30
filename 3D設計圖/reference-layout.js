'use strict';
(() => {
  const p=window.CASTLE_PLAN;
  if(p.referenceRevision)return;
  p.referenceRevision='figure-01-plan-figure-12-massing';
  p.wings=[
    {id:'west',name:'西翼 · 御膳與狩獵長屋',x:-31,y:0,w:14,d:40,eave:1.8,stairX:-36,stairY:-18},
    {id:'east',name:'東翼 · 木工與鍛冶長屋',x:31,y:0,w:14,d:40,eave:1.8,stairX:36,stairY:-18},
    {id:'south',name:'南翼 · 遠古鍊金長屋',x:0,y:-30,w:40,d:12,eave:1.8,stairX:17,stairY:-34}
  ];
  p.workshops=[
    {id:'kitchen',name:'御膳廚房',x:-31,y:10,w:14,d:20,wing:'west',region:'workshops'},
    {id:'hunter',name:'狩獵裁縫坊',x:-31,y:-10,w:14,d:20,wing:'west',region:'workshops'},
    {id:'carpenter',name:'木工建材坊',x:31,y:10,w:14,d:20,wing:'east',region:'workshops'},
    {id:'smith',name:'鍛冶重工坊',x:31,y:-10,w:14,d:20,wing:'east',region:'workshops'},
    {id:'collector',name:'死靈與遠古廳',x:-12,y:-30,w:16,d:12,wing:'south',region:'workshops'},
    {id:'passage',name:'中央穿堂',x:0,y:-30,w:8,d:12,wing:'south',region:'workshops'},
    {id:'alchemy',name:'鍊金實驗室',x:12,y:-30,w:16,d:12,wing:'south',region:'workshops'}
  ];
  p.castle={x:0,y:54,platform:{x:0,y:50,w:48,d:44,h:4},base:{x:0,y:54,w:40,d:36,h:4,top:8},turrets:[[-20,65],[-20,54],[-20,42]]};
  p.court={
    outer:[[-19,13],[-20,8],[-16,2],[-19,-6],[-18,-13],[-14,-18],[-6,-20],[3,-18],[8,-20],[16,-18],[20,-11],[17,-5],[21,0],[18,6],[20,13],[17,16],[12,20],[4,22],[-4,20],[-12,21],[-17,16]],
        inner:[[-10,8],[-11,0],[-9,-5],[-12,-9],[-8,-13],[-3,-12],[3,-14],[10,-12],[12,-7],[10,0],[11,5],[10,10],[4,13],[-3,12],[-8,13]],
    bridges:[{name:'北橋',x:0,y:16,w:4,d:10},{name:'南橋',x:0,y:-16,w:4,d:10},{name:'西橋',x:-16,y:0,w:12,d:4},{name:'東橋',x:16,y:0,w:12,d:4}]
  };
  p.nursery={x:-34,y:31,w:10,d:12,h:0};
  p.keeper={x:61,y:45,w:8,d:8,h:0};
  p.mill={x:47,y:54,w:8,d:8,h:4};
  p.pens=Array.from({length:5},(_,i)=>({x:60,y:28-i*16,w:36,d:16,covered:12,eave:.8}));
  p.terraces=Array.from({length:8},(_,i)=>({id:i+1,front:42+i*4,back:46+i*4,h:2+i*1.5,xmin:-68,xmax:-27}));
  p.forest=Array.from({length:32},(_,i)=>({x:-74+(i%2)*2,y:-66+Math.floor(i/2)*9,h:.5+(Math.floor(i/2)*9)/135*12,kind:i%4===0?'pine':i%4===1?'bamboo':'broadleaf',height:6+(i%5)*.8}));
  for(let i=0;i<9;i++)p.forest.push({x:-66+i*4.6,y:75,h:12.5,kind:i%3===0?'pine':'broadleaf',height:7+(i%3)});
  p.paddies=[];
  for(let row=0;row<3;row++)for(let col=0;col<2;col++)p.paddies.push({x:-61+col*12,y:-8-row*10,w:10,d:6,bottom:-.5,water:0,id:p.paddies.length+1});
  for(const [x,y,w,d] of [[-62,-39,9,6],[-50,-39,11,6],[-38,-39,9,6],[-28,-39,7,6]])p.paddies.push({x,y,w,d,bottom:-.5,water:0,id:p.paddies.length+1});
  p.dryBeds=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)p.dryBeds.push({x:-61+c*6,y:32-r*10,w:4,d:8,h:2,row:r,id:r*4+c+1});
  p.cottages=[];for(const y of [-51,-65])for(const side of [-1,1])for(let i=0;i<6;i++)p.cottages.push({x:side*(10+i*9),y,w:7,d:6,h:0,eave:.6,id:p.cottages.length+1});
  p.water={
    upper:[[38,79,12],[39,74,12],[37,70,12],[37,66,12]],
    fallStart:[37,66,12],fallEnd:[37,60,4],width:4,creekWidth:3.6,drainageWidth:2.3,
    pool:{x:37,y:55,rx:7,ry:7,water:4,bottom:2},
    creek:[[37,49,4],[33,39,3],[31,29,2],[27,25,1],[21,23,.5],[17,15,0]],
        drainage:[[-17,-15,0],[-23,-23,0],[-39,-23,0],[-41,-33.5,0],[-45,-33.5,0],[-61,-33.5,0],[-69,-33.5,0],[-69,-47,0],[-69,-64,0],[-69,-74,0]],
    wheels:[[36,48,4],[41,48,4]]
  };
  // Keep identities and recipes from the guide, but move stations and beds into the reference layout.
  function moveWorkshop(x,y){return y<=-12&&Math.abs(x)<=20?[x,y-10]:[x<0?x-11:x+11,y-8];}
  p.npcs=p.npcs.map(n=>{n=[...n];if(n[9]==='workshops'){[n[3],n[4]]=moveWorkshop(n[3],n[4]);[n[6],n[7]]=moveWorkshop(n[6],n[7]);}else if(n[9]==='castle'){n[4]+=10;n[7]+=10;}return n;});
  const helper=p.npcs[1];[helper[3],helper[4],helper[6],helper[7]]=[-34,30,-31,14];
  [p.npcs[6][3],p.npcs[6][4]]=[36,4];
  [p.npcs[20][3],p.npcs[20][4],p.npcs[20][6],p.npcs[20][7]]=[60,44,63,46];
  [p.npcs[21][3],p.npcs[21][4],p.npcs[21][6],p.npcs[21][7]]=[46,54,49,55];
  [[-19,-51],[-37,-51],[-46,-65],[19,-51],[37,-51],[46,-65]].forEach(([x,y],i)=>{const n=p.npcs[22+i];[n[3],n[4],n[6],n[7]]=[x,y,x+1,y+.5];});
  p.equipment=p.equipment.map(e=>{e=[...e];if(e[5]==='workshops'){[e[2],e[3]]=moveWorkshop(e[2],e[3]);if(e[1]==='Blast_Furnace')[e[2],e[3]]=[28,-22];if(e[1]==='Smelter')[e[2],e[3]]=[35,-22];}return e;});
  const nurseryStations=[[-37.5,35.4],[-30.5,35.4],[-41,31]];p.equipment.filter(e=>e[5]==='farm').forEach((e,i)=>[e[2],e[3]]=nurseryStations[i]);
  p.castleFloors.forEach(f=>f.items.forEach(item=>item[2]+=10));
  p.animals.forEach(a=>a[1]=56+(a[1]-51)*1.2);
  p.pets.forEach(a=>{if(a[5]==='castle')a[2]+=10;else if(a[5]==='workshops'){a[1]=-26;a[2]=8;}else if(a[5]==='ranch'){a[1]=59;a[2]=42;}else if(a[0]==='町家伴行貓'){a[1]=19;a[2]=-51;}});
  p.regions.forEach(r=>{if(r.id==='court')r.size=52;if(r.id==='castle'){r.y=54;r.size=74;}if(r.id==='water'){r.x=38;r.y=57;r.size=64;}if(r.id==='workshops')r.size=90;if(r.id==='town')r.name='南之丸 · 兩排獨立町家';});
  p.materials.push(['rock','自然岩壁','Rough_Stone_Block','#92978c']);
  p.decisions=[
    ['圖面優先順序','以圖 1 決定整體平面、圖 12 決定建築群與地形樣貌；舊細部圖及舊版 3D 配置不再覆蓋整體樣貌。尺規亂碼仍不採用，座標由 160 m 範圍重新比例放樣。'],
    ['三翼完全分離','西／東翼各 14×40 m，中心 X±31；南翼 40×12 m、Y−30。建築間保留通路，屋簷亦不接觸，每翼只有一座連續屋頂。'],
    ['南之丸恢復聚落','兩排、每排東西各六棟，共 24 棟獨立小町家；不是十軒連棟大屋。六位村民各入住一間，其餘為茶屋與空房。'],
    ['中央自然曲水','御庭改為不規則乾燥島與弧形環池，四座朱紅木橋連接三翼及北側平台；保留原點祭壇、B1 階梯、手水舍與迎賓松。'],
    ['西北曲線梯田','八級梯田高程 +2～+12.5 m，明確石砌擋土與曲線草坡。西側／北側林帶的地基高度亦漸升，不再全放在單一 +4 m 平台。'],
    ['水田重建','十塊獨立淺水田，田底 −0.5 m、水面 0 m，泥土底、田埂、給排水與成排稻株都建模；不再用三片平面藍色玻璃代表。'],
    ['東北溪谷','北界高位溪流 → 嶙峋岩壁瀑布 → +4 m 圓潭與雙水車 → 彎溪流入御庭。磨坊移至 (47,54,+4)，溪流不穿越東翼。'],
    ['配套避讓','為留出三翼通路及溪谷，御廄依整體圖比例改為 36×16 m（西 12 m 木廄、東 24 m 草地），X42～78。外排爐移至東翼南端；NPC／床位同步重排，仍為 28 人、28 專屬床、36 個 B1 箱。'],
    ['非遊戲模擬','材質為 CC0，植栽與岩石為本專案生成幾何。水流、尋路與舒適度仍須遊戲內測試；五重天守高程仍為 +8／16／24／32／40，最高 +52 m。']
  ];
})();
