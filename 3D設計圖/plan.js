'use strict';
window.CASTLE_PLAN = {
  wiki: 'https://enshrouded.wiki.gg/wiki/',
  regions: [
    {id:'court', name:'本丸御庭與地下金庫', x:0,y:0,h:0,size:30},
    {id:'workshops',name:'三翼工匠長屋',x:0,y:-5,h:0,size:65},
    {id:'castle',name:'北之丸五重天守',x:0,y:44,h:24,size:65},
    {id:'farm',name:'西之丸農業與竹林',x:-52,y:0,h:0,size:80},
    {id:'ranch',name:'東之丸五座御廄',x:54,y:0,h:0,size:90},
    {id:'town',name:'南之丸十軒長屋',x:0,y:-54,h:0,size:75},
    {id:'water',name:'東北瀑布與雙聯水車',x:30,y:48,h:5,size:50}
  ],
  materials: [
    ['stone','粗糙石塊','Rough_Stone_Block','#757e7a'],
    ['plaster','木造框架塊','Half-Timbered_Block','#e6ded0'],
    ['wood','精製木塊','Refined_Wood_Block','#70513b'],
    ['roof','花崗岩裝飾屋頂','Granite_Ornamented_Roof_Block','#3e535d'],
    ['glow','白色發光塊','White_Luminescent_Block','#e9e7c6'],
    ['soil','施肥農地土','Fertilised_Farm_Soil','#5d4734'],
    ['sand','細沙','Fine_Sand','#c6bf9e'],
    ['bamboo','竹木塊','Bamboo_Block','#6c8b47']
  ],
  decisions: [
    ['座標與五重結構','統一使用 X 東、Y 北、Z 高程（m），每格 4 m。天守中心 (0,44)，五層 32 / 24 / 20 / 16 / 12 m；石垣下層 40×32 m、上層 36×32 m，南緣 Y28 避開工坊；不採用原圖中庭方塔。'],
    ['金庫箱數','指南寫 33–48，問題表寫 36–48：取交集下限 36 箱，三區各 12；保留西南樓梯與中央承重柱。'],
    ['牧場與番屋避讓','保留五欄 44×16 m（X32–76，Y−44–36）；牧夫番屋移至 (42,44)，採 8×8 m 番屋，避免壓縮前兩欄並避開水車坊。'],
    ['東北水車避讓','水車坊原 (16,22) 與東翼工坊相交：移至 (28,44)，高程仍 +4 m；假山移至 (30,58)，給水 +12 m。尾水經 Z−1 m 暗渠穿越工坊地下，需預留防水涵洞；不是水流模擬。'],
    ['寵物總數','以 3 貓 3 狗為準：西翼 1 貓、天守 1F 1 狗、4F 1 貓、牧場 1 狗、町家 1 貓、大手門 1 狗。毛色與姓名不強行對應。'],
    ['育苗亭與梯田避讓','原育苗亭與西翼廚房重疊，移至 (−34,40)，助手移至 (−31,38)；旱田單元北緣縮至 Y33。助手床仍在西翼 2F，尋路與認床須實測。'],
    ['上層樓梯與平台','12 m 核心筒只適用低層；上層改為中央 4×4 m 折返梯井，避免占滿 5F。+44 m 四向滑翔台均補齊；須自設門洞與護欄。'],
    ['長屋接角','側翼 X±12–28 / Y−12–28，南翼 X±20 / Y−28–−12；接角只共用邊界，穿堂保留 4 m 淨寬。南方為兩列各五軒連棟町家，而非 24 棟小屋。'],
    ['施工適用範圍','設備、床位與人偶採占地示意，非遊戲碰撞盒。水田 Z−0.5 為田底、表面 Z0；錦鯉池與外濠底 Z−2、水面 Z0。水位、尋路與機關須實測。']
  ],
  workshops: [
    {id:'kitchen',name:'御膳廚房',x:-20,y:18,w:16,d:20,region:'workshops'},
    {id:'hunter',name:'狩獵裁縫坊',x:-20,y:-2,w:16,d:20,region:'workshops'},
    {id:'carpenter',name:'木工建材坊',x:20,y:18,w:16,d:20,region:'workshops'},
    {id:'smith',name:'鍛冶重工坊',x:20,y:-2,w:16,d:20,region:'workshops'},
    {id:'collector',name:'死靈與遠古廳',x:-12,y:-20,w:16,d:16,region:'workshops'},
    {id:'passage',name:'中央穿堂與空中渡廊',x:0,y:-20,w:8,d:16,region:'workshops'},
    {id:'alchemy',name:'鍊金實驗室',x:12,y:-20,w:16,d:16,region:'workshops'}
  ],
  // x/y/h and bx/by/bh are separate station and bed coordinates, in guide axes.
  npcs: [
    ['農夫','Emily Fray','Farmer',-20,14,0,-24,22,4,'workshops'],
    ['農夫助手','Fenrig Mills, Jr.','Survivors',-31,38,0,-20,22,4,'farm'],
    ['漁夫','Melville Fontane','Fisherman',-16,14,0,-16,22,4,'workshops'],
    ['獵人','Athalan Skree','Hunter',-20,-6,0,-24,2,4,'workshops'],
    ['獵人助手','Galen Yager','Survivors',-14,-4,0,-20,2,4,'workshops'],
    ['木匠','Cade Hawthorn','Carpenter',18,16,0,17,22,4,'workshops'],
    ['木匠助手','Aunt Braelyn','Survivors',26,8,0,23,22,4,'workshops'],
    ['鐵匠','Oswald Anders','Blacksmith',20,-6,0,17,2,4,'workshops'],
    ['鐵匠助手','Rochelle Anders','Survivors',20,-2,0,23,2,4,'workshops'],
    ['收藏家','Alden Crowley','Collector',-14,-16,0,-17,-24,4,'workshops'],
    ['收藏助手','Nameless One','Survivors',-10,-16,0,-12,-24,4,'workshops'],
    ['學者','Loraine Crim','Scholar',-6,-16,0,-7,-24,4,'workshops'],
    ['吟遊詩人','Valory','Bard',-3,-22,0,-3,-22,4,'workshops'],
    ['新春商人','Mei-Yin Chen','Survivors',3,-22,0,3,-22,4,'workshops'],
    ['鍊金師','Balthazar','Alchemist',10,-20,0,7,-24,4,'workshops'],
    ['鍊金助手','Lady Leclair','Survivors',14,-16,0,13,-24,4,'workshops'],
    ['守衛村民','Anton Godwin','Survivors',6,32,8,-11,32,8,'castle'],
    ['理髮師','Elio Ricci','Barber',10,36,16,9,39,16,'castle'],
    ['侍女村民','Kaori Conway','Survivors',2,36,24,-6,37,24,'castle'],
    ['詩人助手','Chester Loft','Survivors',4,40,40,-4,40,40,'castle'],
    ['牧場村民','Robert Gibson','Survivors',40,44,0,44,46,0,'ranch'],
        ['水車村民','Oscar Godwin','Survivors',28,44,4,31,46,4,'water'],
    ['町家村民','Hannah','Survivors',-18,-38,0,-24,-38,0,'town'],
    ['町家村民','Marianne','Survivors',-18,-48,0,-24,-48,0,'town'],
    ['町家村民','Hugo','Survivors',-18,-58,0,-24,-58,0,'town'],
    ['町家村民','Gabrielle','Survivors',18,-38,0,24,-38,0,'town'],
    ['町家村民','Gunther','Survivors',18,-48,0,24,-48,0,'town'],
    ['町家村民','Ramone','Survivors',18,-58,0,24,-58,0,'town']
  ],
  equipment: [
    ['烤爐','Oven',-25,25,0,'workshops','kiln'],['廚房灶','Kitchen',-20,25,0,'workshops','table'],['烹飪台','Cooking_Station',-15,25,0,'workshops','table'],['海鮮架','Seafood_Grill',-25,18,0,'workshops','rack'],['攪拌器','Butter_Churn',-25,12,0,'workshops','barrel'],['咖啡機','Coffee_Brewery',-20,10,0,'workshops','table'],['咖啡烘豆機','Coffee_Drum_Roaster',-15,10,0,'workshops','barrel'],
    ['織布機','Loom',-25,5,0,'workshops','rack'],['紡車','Spinning_Wheel',-20,5,0,'workshops','wheel'],['紡紗機','Spinning_Machine',-15,5,0,'workshops','rack'],['手紡錘','Hand_Spindle',-25,-1,0,'workshops','table'],['曬乾架','Drying_Rack',-25,-8,0,'workshops','rack'],['鞣革台','Tanning_Station',-16,-9,0,'workshops','table'],
    ['工作台','Workbench',15,25,0,'workshops','table'],['裝飾台','Decoration_Workbench',20,25,0,'workshops','table'],['磚窯','Kiln',25,25,0,'workshops','kiln'],['桌鋸','Table_Saw',15,19,0,'workshops','table'],['砌石工具','Masonry_Tools',25,19,0,'workshops','table'],
    ['鍛造工具','Smithing_Tools',15,4,0,'workshops','table'],['鍛造爐','Forge',25,4,0,'workshops','kiln'],['寶石爐','Gem_Forge',15,-3,0,'workshops','kiln'],['木炭窯','Charcoal_Kiln',25,-9,0,'workshops','kiln'],['高爐（外排）','Blast_Furnace',30,-4,0,'workshops','kiln'],['冶煉爐（外排）','Smelter',30,-9,0,'workshops','kiln'],
    ['靈質壓榨機','Ectoplasm_Press',-17,-25,0,'workshops','rack'],['注能台','Infusion_Station',-12,-25,0,'workshops','table'],['邏輯工作台','Sparkworks_Workbench',-7,-25,0,'workshops','table'],['樂器架','Bard',-3,-26,0,'workshops','rack'],['節慶攤','Survivors',3,-26,0,'workshops','table'],
    ['鍊金台','Alchemy_Station',6,-25,0,'workshops','table'],['研缽','Mortar',11,-25,0,'workshops','barrel'],['實驗室','Laboratory',17,-25,0,'workshops','rack'],['研磨石','Grinding_Stones',17,-20,0,'workshops','wheel'],['調色台','Coloring_Station',17,-15,0,'workshops','table'],
    ['植物年鑑','Almanac_of_Plants_and_Seedlings',-38,44,0,'farm','table'],['骨粉研磨石','Grinding_Stones',-38,36,0,'farm','wheel'],['燻煙器','Beehive_Smoker',-42,36,0,'farm','barrel']
  ],
  castleFloors: [
    {h:8,w:32,name:'1F · 名刀神兵殿',items:[['傳奇神兵台',0,57,'table'],['發光燈箱',7,57,'table'],['名刀展示架',-13,54,'rack'],['雙手巨劍架',-13,49,'rack'],['戰斧展示架',-13,44,'rack'],['戰錘展示架',-13,39,'rack'],['盾牌掛牆',-14,35,'shield'],['傳奇弓箭架',13,54,'rack'],['匕首展示櫃',13,49,'table'],['魔杖水晶櫃',13,44,'rack'],['法杖展示座',13,39,'rack']]},
    {h:16,w:24,name:'2F · 百領甲冑間',items:[['戰士重甲人偶',-8,52,'mannequin'],['重盾展示座',-8,48,'shield'],['遊俠輕甲人偶',8,52,'mannequin'],['披風展示架',8,48,'rack'],['法師長袍人偶',-8,36,'mannequin'],['法冠展示櫃',-8,40,'table'],['傳奇時裝人偶',8,44,'mannequin'],['理髮換裝椅',9,35,'chair'],['穿衣鏡',10,42,'rack']]},
    {h:24,w:20,name:'3F · 首級銘品閣',items:[['巨龍首級座',0,51,'table'],['頭目獎盃牆',6,51,'rack'],['重怪首級架',-8,48,'rack'],['名畫展示牆',-8,43,'rack'],['魚類獎盃盤',8,48,'table'],['古董花瓶座',8,43,'barrel'],['滿漢料理桌',0,37,'table']]},
    {h:32,w:16,name:'4F · 機關秘寶室',items:[['秘密石門',0,48,'door'],['傳奇寶箱陣',-4,50,'chest'],['黃金財寶堆',4,50,'chest'],['邏輯開關',-6,44,'table'],['壓力踏板',6,44,'table'],['感應機關',-6,40,'table'],['機關燈號',6,40,'barrel']]},
    {h:40,w:12,name:'5F · 城主寢宮',items:[['城主大床',-3,47,'bed'],['石造壁爐',0,48,'kiln'],['豪華浴缸',3,47,'bath'],['黃金王座',3,44,'chair'],['豎琴與魯特琴',-4,44,'rack'],['手鼓與長笛',0,40,'table']]}
  ],
  animals: [
    ['普通山羊',51,30,0,'goat',0],['捲毛山羊',60,27,0,'goat',0],['精靈鹿',57,12,0,'deer',1],['犛牛',57,-4,0,'yak',2],['紅尾鳥',52,-19,0,'bird',3],['帆鳥',58,-21,0,'bird',3],['跳兔',65,-18,0,'rabbit',3],['水豚',52,-35,0,'capybara',4],['沙丘犰狳',61,-36,0,'armadillo',4]
  ],
  pets: [['西翼伴行貓',-13,16,0,'cat','workshops'],['天守守護犬',9,32,8,'dog','castle'],['秘寶室黑貓',0,38,32,'cat','castle'],['牧羊犬',42,40,0,'dog','ranch'],['町家伴行貓',16,-60,0,'cat','town'],['大手門斑點狗',4,-69,0,'dog','town']]
};
