'use strict';
window.AtlasVisuals = (() => {
  const T=window.THREE;
  const palettes={rock:'#8f988e',stone:'#d0d4c7',wood:'#dac9b0',roof:'#d0d7d9',plaster:'#ece6d7',grass:'#b8bd9c',soil:'#c9b99b',bamboo:'#94a95d',sand:'#d8c9a5'};
  function create({renderer,scene,camera,plane,onDirty}) {
    const textureCache=new Map(),materialCache=new Map(),animated=[],waterUniforms=[],particles=[],loads=[];
    const sourceFor={rock:'rock',stone:'stone',wood:'wood',roof:'roof',plaster:'plaster',grass:'grass',soil:'soil',bamboo:'wood',sand:'soil'};
    let time=0,enabled=true,quality='high',disposed=false;
    function load(source,kind) {
      const key=source+kind;if(textureCache.has(key))return textureCache.get(key);
      const data=window.ATLAS_TEXTURES?.[source]?.[kind];if(!data)throw new Error('Missing local CC0 texture: '+key);
      let resolve,reject;loads.push(new Promise((yes,no)=>{resolve=yes;reject=no;}));
      const tex=new T.TextureLoader().load(data,()=>{onDirty();resolve();},undefined,()=>reject(new Error('Cannot decode texture '+key)));
      tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());tex.encoding=kind==='color'?T.sRGBEncoding:T.LinearEncoding;
      textureCache.set(key,tex);return tex;
    }
    function material(id) {
      if(materialCache.has(id))return materialCache.get(id);
      if(id==='glow') {
        const m=new T.MeshStandardMaterial({color:'#ede4cc',emissive:'#ffd392',emissiveIntensity:.65,roughness:.72,clippingPlanes:[plane],clipShadows:true});materialCache.set(id,m);return m;
      }
      const source=sourceFor[id]||'wood';
      const m=new T.MeshStandardMaterial({color:new T.Color(palettes[id]||'#ffffff').convertSRGBToLinear(),envMapIntensity:.09,map:load(source,'color'),normalMap:load(source,'normal'),roughnessMap:load(source,'roughness'),normalScale:new T.Vector2(id==='stone'?.65:id==='roof'?.7:.3,id==='stone'?.65:id==='roof'?.7:.3),roughness:id==='roof'?.86:1,metalness:id==='roof'?.08:0,clippingPlanes:[plane],clipShadows:true,side:T.DoubleSide});
      const scale={rock:.2,stone:.32,wood:.3,roof:.35,plaster:.25,grass:.2,soil:.4,bamboo:.55,sand:.35}[id]||.35;
      // World-space UVs keep stone courses and wood grain at the same scale on large and small meshes.
      m.onBeforeCompile=shader=>{
        shader.uniforms.atlasScale={value:scale};
        shader.vertexShader='varying vec3 atlasPosition; varying vec3 atlasNormal;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\natlasPosition=(modelMatrix*vec4(transformed,1.0)).xyz;atlasNormal=normalize(mat3(modelMatrix)*objectNormal);');
        shader.fragmentShader='varying vec3 atlasPosition; varying vec3 atlasNormal; uniform float atlasScale;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <uv_pars_fragment>',`#include <uv_pars_fragment>
          vec2 atlasUV(){vec3 n=abs(normalize(atlasNormal));if(n.y>max(n.x,n.z))return atlasPosition.xz*atlasScale;if(n.x>n.z)return atlasPosition.zy*atlasScale;return atlasPosition.xy*atlasScale;}
          #define vUv atlasUV()`);
      };
      m.customProgramCacheKey=()=> 'atlas-world-uv-'+id;
      materialCache.set(id,m);return m;
    }
    const water=new T.MeshPhysicalMaterial({color:new T.Color('#365c50').convertSRGBToLinear(),roughness:.24,metalness:0,transparent:true,opacity:.68,depthWrite:false,clearcoat:.2,clearcoatRoughness:.28,envMapIntensity:.025,clippingPlanes:[plane],side:T.DoubleSide});
    water.onBeforeCompile=shader=>{
      shader.uniforms.atlasTime={value:time};waterUniforms.push(shader.uniforms.atlasTime);
      shader.vertexShader='varying vec3 atlasWaterPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\natlasWaterPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader='varying vec3 atlasWaterPosition; uniform float atlasTime;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        if(abs(normal.y)>0.5){vec2 p=atlasWaterPosition.xz;float a=dot(p,vec2(1.4,.65))+atlasTime*1.7;float b=dot(p,vec2(-.6,2.1))-atlasTime*1.1;float c=dot(p,vec2(.45,-.7))+atlasTime*.6;normal=normalize(normal+vec3(cos(a)*.025+cos(b)*.02,0.0,sin(c)*.035));}`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec2 p=atlasWaterPosition.xz;float ripple=sin(dot(p,vec2(1.4,.65))+atlasTime*1.7)*.45+sin(dot(p,vec2(-.6,2.1))-atlasTime*1.1)*.3+sin(dot(p,vec2(.45,-.7))+atlasTime*.6)*.25;diffuseColor.rgb*=.97+ripple*.025;`);
    };
    water.customProgramCacheKey=()=> 'atlas-flowing-water';
    const ambient=new T.HemisphereLight('#cbdbe4','#554939',.7);scene.add(ambient);
    const sun=new T.DirectionalLight('#ffdbad',2.2);sun.position.set(-65,82,40);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-115;sun.shadow.camera.right=115;sun.shadow.camera.top=115;sun.shadow.camera.bottom=-115;sun.shadow.camera.near=1;sun.shadow.camera.far=330;sun.shadow.normalBias=.07;sun.shadow.bias=-.00015;sun.target.position.set(0,8,0);scene.add(sun,sun.target);
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
    const sky=new T.Sky();sky.scale.setScalar(45000);sky.material.uniforms.turbidity.value=2.8;sky.material.uniforms.rayleigh.value=1.6;sky.material.uniforms.mieCoefficient.value=.004;sky.material.uniforms.mieDirectionalG.value=.8;scene.add(sky);
    const pmrem=new T.PMREMGenerator(renderer);pmrem.compileCubemapShader();let environment=null,skyTexture=null;
    function paintedSky(mode){
      const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,512),night=mode==='night';
      g.addColorStop(0,night?'#071327':'#759eaf');g.addColorStop(.35,night?'#1a3048':'#acbdc2');g.addColorStop(.52,night?'#304654':mode==='golden'?'#d5c0a2':'#cdd5d0');g.addColorStop(1,night?'#172c32':'#7e9477');ctx.fillStyle=g;ctx.fillRect(0,0,1024,512);
      for(let i=0;i<(night?120:28);i++){const x=(i*71.87)%1024,y=night?(i*43.3)%220:100+(i*37.2)%135;if(night){ctx.fillStyle='#cadceb77';ctx.fillRect(x,y,1,1);}else{const haze=ctx.createRadialGradient(x,y,0,x,y,50+(i%3)*20);haze.addColorStop(0,'#e9e6db25');haze.addColorStop(1,'#ffffff00');ctx.fillStyle=haze;ctx.fillRect(x-90,y-90,180,180);}}
      if(skyTexture)skyTexture.dispose();skyTexture=new T.CanvasTexture(c);skyTexture.mapping=T.EquirectangularReflectionMapping;skyTexture.encoding=T.sRGBEncoding;scene.background=skyTexture;sky.visible=false;
    }
    function lighting(mode='day') {
      const presets={day:{sun:[-60,115,70],color:'#fff1d7',power:2.1,ambient:.78,fog:'#c6d2c5',density:.0014,exposure:1.04},golden:{sun:[-85,48,40],color:'#ffd4a1',power:2.1,ambient:.6,fog:'#b9b8a2',density:.0018,exposure:1.05},night:{sun:[-70,-8,35],color:'#9dbbd6',power:.23,ambient:.38,fog:'#253747',density:.0024,exposure:1.2}};
      const p=presets[mode]||presets.golden;sun.position.set(...p.sun);sun.color.set(p.color);sun.intensity=p.power;ambient.intensity=p.ambient;renderer.toneMappingExposure=p.exposure;scene.fog=new T.FogExp2(p.fog,p.density);scene.background=new T.Color(p.fog);
      sky.material.uniforms.sunPosition.value.copy(sun.position).normalize();
      const envScene=new T.Scene();const copy=sky.clone();copy.visible=true;envScene.add(copy);if(environment)environment.dispose();environment=pmrem.fromScene(envScene,.02);      scene.environment=environment.texture;paintedSky(mode);
      material('glow').emissiveIntensity=mode==='night'?1.3:.5;sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;onDirty();
    }
    const composer=new T.EffectComposer(renderer),scenePass=new T.RenderPass(scene,camera);composer.addPass(scenePass);
    const bloom=new T.UnrealBloomPass(new T.Vector2(1,1),.2,.48,.82);composer.addPass(bloom);
    const fxaa=new T.ShaderPass(T.FXAAShader);composer.addPass(fxaa);
    const gamma=new T.ShaderPass(T.GammaCorrectionShader);composer.addPass(gamma);
    function resize(w,h){composer.setSize(w,h);composer.setPixelRatio(renderer.getPixelRatio());fxaa.uniforms.resolution.value.set(1/(w*renderer.getPixelRatio()),1/(h*renderer.getPixelRatio()));onDirty();}
    function setQuality(value){quality=value;renderer.setPixelRatio(Math.min(devicePixelRatio,value==='high'?1.5:value==='medium'?1.15:1));renderer.shadowMap.enabled=value!=='low';const size=value==='high'?2048:1024;if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.mapSize.set(size,size);sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;bloom.enabled=value!=='low';resize(renderer.domElement.clientWidth,renderer.domElement.clientHeight);onDirty();}
    function particleMaterial(color,size,kind) {
      const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:kind==='fire'?T.AdditiveBlending:T.NormalBlending,uniforms:{uTime:{value:time},uCut:{value:plane.constant},uColor:{value:new T.Color(color)},uSize:{value:size},uKind:{value:kind==='smoke'?1:kind==='petal'?2:kind==='splash'?3:kind==='foam'?4:0}},vertexShader:`attribute float phase;uniform float uTime;uniform float uSize;uniform float uKind;varying float life;varying float worldHeight;
        void main(){life=fract(phase+uTime*(uKind==3.0?.65:uKind==2.0?.065:.32));vec3 p=position;if(uKind==2.0){p.y-=life*7.0;p.x+=sin(life*7.0+phase*20.0)*1.8;p.z+=cos(life*5.0+phase*13.0)*1.2;}else if(uKind==3.0){p.y+=sin(life*3.14159)*1.4;p.x+=sin(phase*35.0)*life*2.4;p.z+=cos(phase*22.0)*life*2.4;}else if(uKind==4.0){p.y+=sin(life*6.0)*.04;p.x+=sin(phase*35.0)*life*.25;p.z+=cos(phase*22.0)*life*.25;}else{p.y+=life*(uKind==1.0?6.0:2.5);p.x+=sin(life*8.0+phase*20.0)*life*.55;p.z+=cos(life*8.0+phase*11.0)*life*.55;}vec4 world=modelMatrix*vec4(p,1.0);worldHeight=world.y;vec4 mv=viewMatrix*world;gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uSize*(uKind==1.0?(.7+life*1.5):1.0)/max(1.0,-mv.z),1.0,72.0);}`,
        fragmentShader:`uniform vec3 uColor;uniform float uKind;uniform float uCut;varying float life;varying float worldHeight;void main(){if(worldHeight>uCut)discard;vec2 p=gl_PointCoord*2.0-1.0;float r=dot(p,p);if(r>1.0)discard;float alpha=(1.0-smoothstep(.03,1.0,r))*sin(life*3.14159)*(uKind==1.0?.2:uKind==2.0?.65:.8);gl_FragColor=vec4(uColor,alpha);}`});particles.push(m);return m;
    }
    function emit(g,x,y,z,count,color,size,kind,spread=.6) {
      const positions=[],phases=[];for(let i=0;i<count;i++){const phase=(i*.61803398875)%1;positions.push(x+Math.sin(i*37.3)*spread,y+(kind==='petal'?(i%7)*.6:0),z+Math.cos(i*12.7)*spread);phases.push(phase);}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('phase',new T.Float32BufferAttribute(phases,1));const points=new T.Points(geo,particleMaterial(color,size,kind));points.frustumCulled=false;points.userData.kind='effect';g.add(points);return points;
    }
    function fire(g,x,y,z,scale=1) {
      const flameMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{uTime:{value:time},uCut:{value:plane.constant}},vertexShader:'varying vec2 vFlame;varying float worldHeight;void main(){vFlame=uv;vec4 w=modelMatrix*vec4(position,1.0);worldHeight=w.y;gl_Position=projectionMatrix*viewMatrix*w;}',fragmentShader:'varying vec2 vFlame;varying float worldHeight;uniform float uTime;uniform float uCut;void main(){if(worldHeight>uCut)discard;vec2 p=vFlame;float sway=sin(p.y*9.0-uTime*6.0)*.06*p.y;float width=.46*pow(1.0-p.y,1.1)+(sin(p.y*17.0-uTime*8.0)*.5+.5)*.07;float alpha=smoothstep(0.0,.08,width-abs(p.x-.5+sway))*smoothstep(0.0,.08,p.y);vec3 color=mix(vec3(2.0,1.15,.22),vec3(1.25,.15,.015),p.y);gl_FragColor=vec4(color,alpha*.65);}'});
      particles.push(flameMaterial);
      for(let i=0;i<3;i++){const mesh=new T.Mesh(new T.PlaneGeometry(1.4*scale,2.3*scale),flameMaterial);mesh.position.set(x,y+1.15*scale,z);mesh.rotation.y=i*Math.PI/3;mesh.userData.dynamic=true;mesh.userData.kind='effect';g.add(mesh);}
      emit(g,x,y,z,58,'#ffac42',190*scale,'fire',.22*scale);emit(g,x,y+.5,z,22,'#ffe1a4',58*scale,'fire',.3*scale);
      const light=new T.PointLight('#ffad52',2.2,13);light.position.set(x,y+1,z);g.add(light);animated.push({type:'light',object:light});
    }
    function smoke(g,x,y,z){emit(g,x,y,z,42,'#aaa9a2',680,'smoke',.3);}
    function petals(g,x,y,z){emit(g,x,y,z,26,'#ecc7bb',38,'petal',1.8);}
    function waterfall(g,start,end,width=2) {
      const a=new T.Vector3(...start),b=new T.Vector3(...end),direction=b.clone().sub(a),length=direction.length();
      const side=new T.Vector3(1,0,0),normal=new T.Vector3().crossVectors(side,direction).normalize();
      const vertices=[],uv=[];const steps=18;for(let i=0;i<steps;i++){for(const [row,sign] of [[i,-1],[i,1],[i+1,1],[i,-1],[i+1,1],[i+1,-1]]){const t=row/steps,p=a.clone().addScaledVector(direction,t).addScaledVector(side,sign*width/2);vertices.push(p.x,p.y,p.z);uv.push(sign*.5+.5,t);}}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
      const m=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{uTime:{value:time},uCut:{value:plane.constant}},vertexShader:'varying vec2 vFlow;varying float worldHeight;void main(){vFlow=uv;vec4 w=modelMatrix*vec4(position,1.0);worldHeight=w.y;gl_Position=projectionMatrix*viewMatrix*w;}',fragmentShader:`varying vec2 vFlow;varying float worldHeight;uniform float uTime;uniform float uCut;void main(){if(worldHeight>uCut)discard;vec2 p=vFlow;float edge=smoothstep(0.0,.13,p.x)*smoothstep(0.0,.13,1.0-p.x);float streak=sin(p.x*55.0+sin(p.y*22.0-uTime*5.0)*.65)*.5+.5;float foam=pow(streak,5.0)*.6+pow(sin(p.y*34.0-uTime*9.0)*.5+.5,12.0)*.3;vec3 c=mix(vec3(.24,.55,.58),vec3(.83,.92,.89),foam);gl_FragColor=vec4(c,edge*(.67+foam*.28));}`});particles.push(m);
      const mesh=new T.Mesh(geo,m);mesh.userData.dynamic=true;mesh.userData.kind='effect';g.add(mesh);emit(g,b.x,b.y,b.z,90,'#d6e8df',80,'splash',width*.3);return mesh;
    }
    function foam(g,x,y,z,w,d) {
      for(const side of [-1,1])emit(g,x+side*w/2,y,z,24,'#d2e4dd',35,'foam',Math.min(d/2,2));
    }
    function wheel(g,x,y,z) {
      const rotor=new T.Group();rotor.position.set(x,y,z);rotor.userData.dynamic=true;g.add(rotor);
      const wood=material('wood'),metal=new T.MeshStandardMaterial({color:'#495253',metalness:.6,roughness:.6,clippingPlanes:[plane],clipShadows:true});
      for(const side of [-.42,.42]){const rim=new T.Mesh(new T.TorusGeometry(2.4,.13,6,40),wood);rim.rotation.y=Math.PI/2;rim.position.x=side;rotor.add(rim);}
      const axle=new T.Mesh(new T.CylinderGeometry(.23,.23,1.7,12),metal);axle.rotation.z=Math.PI/2;rotor.add(axle);
      for(let i=0;i<12;i++){const angle=i*Math.PI/6;const spoke=new T.Mesh(new T.BoxGeometry(.13,4.65,.15),wood);spoke.rotation.x=angle;rotor.add(spoke);const paddle=new T.Mesh(new T.BoxGeometry(1.2,.24,.7),wood);paddle.position.set(0,Math.sin(angle)*2.35,Math.cos(angle)*2.35);paddle.rotation.x=-angle;rotor.add(paddle);}
      rotor.traverse(o=>{if(o.isMesh){o.userData.dynamic=true;o.castShadow=false;o.receiveShadow=true;}});animated.push({type:'wheel',object:rotor});return rotor;
    }
    function update(dt) {
      if(disposed)return;if(enabled)time+=Math.min(dt,.05);
      waterUniforms.forEach(u=>u.value=time);particles.forEach(m=>{if(m.uniforms.uTime)m.uniforms.uTime.value=time;if(m.uniforms.uCut)m.uniforms.uCut.value=plane.constant;});
      animated.forEach(a=>{if(a.type==='wheel')a.object.rotation.x=-time*.3;else a.object.intensity=2.1+Math.sin(time*8.3)*.18;});
    }
    function setEnabled(value){enabled=value;onDirty();}
    function setCamera(value){camera=value;scenePass.camera=value;onDirty();}
    function render(){renderer.info.autoReset=false;renderer.info.reset();composer.render();}
    function shadows(){sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;onDirty();}
    function dispose(){disposed=true;composer.dispose?.();environment?.dispose();skyTexture?.dispose();pmrem.dispose();textureCache.forEach(t=>t.dispose());materialCache.forEach(m=>m.dispose());particles.forEach(m=>m.dispose());}
    lighting();
    return {setCamera,material,water,lighting,resize,setQuality,setEnabled,update,render,shadows,fire,smoke,petals,waterfall,foam,wheel,ready:()=>Promise.all(loads),get time(){return time;},get enabled(){return enabled;},get quality(){return quality;},dispose,sky,sun,ambient};
  }
  return {create};
})();
