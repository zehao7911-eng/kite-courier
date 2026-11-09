import {terrain} from './core.mjs';
const T=globalThis.THREE;
T.ColorManagement.legacyMode=false;
export class Coast{
 constructor(canvas){
  this.r=new T.WebGLRenderer({canvas,antialias:true});
  this.r.setPixelRatio(Math.min(devicePixelRatio,1.5));this.r.outputEncoding=T.sRGBEncoding;
  this.scene=new T.Scene();this.scene.background=new T.Color(0x48ccf7);this.scene.fog=new T.FogExp2(0x8de5fa,.006);
  this.camera=new T.PerspectiveCamera(59,1,.1,480);
  this.scene.add(new T.HemisphereLight(0xfff6dd,0x5480a3,1.2));
  const sun=new T.DirectionalLight(0xfff1c5,1.65);sun.position.set(-25,50,35);this.scene.add(sun);
  this.geo=new T.BoxGeometry();this.mat=new Map();
  this.box(340,.2,340,0x0badc6,-70,-.25,-40);
  const land=new T.PlaneGeometry(97,130,48,52);land.rotateX(-Math.PI/2);land.translate(13,0,-34);
  const pos=land.attributes.position,colors=[];
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,terrain(x,z));
   const c=new T.Color(x<-24?0xffda80:x<-17?0xe4d86f:0x63cb52);
   c.multiplyScalar(.94+.06*Math.sin(i*2.3));colors.push(c.r,c.g,c.b);
  }
  land.setAttribute('color',new T.Float32BufferAttribute(colors,3));land.computeVertexNormals();
  this.scene.add(new T.Mesh(land,new T.MeshStandardMaterial({vertexColors:true,roughness:1})));
  this.waves=[];
  for(let i=0;i<55;i++)this.waves.push(this.box(.13,.014,2+i%5,0xb4faff,-36-(i%10)*2.5,-.12,Math.sin(i*7)*82-33));
  for(let i=0;i<46;i++){
   const x=8+Math.sin(i*7)*2.7,z=26-i*2.65;
   this.box(3.4,.035,2.67,0xf5c27b,x,terrain(x,z)+.03,z);
  }
  for(let i=0;i<18;i++){
   const x=37+(i%3)*6,z=-15-Math.floor(i/3)*9;
   this.house(x,z,i);
  }
  for(let i=0;i<26;i++){
   const x=17+(i*11%42),z=22-(i*13%110),y=terrain(x,z);
   this.box(.22,1.6,.22,0x9b6342,x,y+.8,z);
   this.ball(1.2,1.25,.95,0x209f71,x,y+2,z);
  }
  const lx=-23,lz=-45,ly=terrain(lx,lz);
  for(let i=0;i<7;i++)this.box(2.1-i*.1,1.05,2.1-i*.1,i%2?0xff4a45:0xfff2d6,lx,ly+.52+i,lz);
  this.box(1.85,.85,1.85,0xffe352,lx,ly+7.35,lz);this.box(2.2,.35,2.2,0x23558a,lx,ly+8,lz);
  for(let i=0;i<5;i++){const h=this.house(31+i*3,-49,1+i);h.scale.setScalar(.6)}
  for(let i=0;i<8;i++){
   const x=9+Math.cos(i*Math.PI/4)*5,z=-39+Math.sin(i*Math.PI/4)*5,y=terrain(x,z);
   this.box(.12,3,.12,0xfff1d7,x,y+1.5,z);this.box(.77,.49,.04,[0xff586e,0xffe248,0x2ddbd2][i%3],x+.38,y+2.7,z);
  }
  this.car=this.group();
  this.box(1.15,.24,1.75,0xff6457,0,.40,0,this.car);
  this.wheels=[];
  for(const x of [-.63,.63])for(const z of [-.63,.63]){
   const wheel=this.group(this.car);wheel.position.set(x,.28,z);
   const disk=new T.Mesh(new T.CylinderGeometry(.28,.28,.18,14),this.material(0x204563));
   disk.rotation.z=Math.PI/2;wheel.add(disk);this.wheels.push(wheel);
  }
  this.box(.075,2.2,.075,0xfff5d9,.12,1.55,-.49,this.car);
  const sail=new T.Shape();sail.moveTo(0,0);sail.lineTo(0,1.65);sail.lineTo(1.03,0);sail.closePath();
  this.sail=new T.Mesh(new T.ShapeGeometry(sail),new T.MeshStandardMaterial({color:0xffd835,side:T.DoubleSide}));
  this.sail.position.set(.12,.92,-.49);this.car.add(this.sail);
  this.box(.51,.53,.38,0x377ac4,0,.86,.29,this.car);
  this.box(.34,.36,.34,0xd99a75,0,1.29,.27,this.car);
  this.box(.4,.13,.39,0xfff0b9,0,1.47,.27,this.car);
  this.box(.45,.05,.25,0xff6a50,0,1.42,.10,this.car);
  this.marker=this.group();
  this.box(.76,.49,.12,0xffeb62,0,0,0,this.marker);
  this.box(.53,.10,.15,0xff8762,0,-.03,.03,this.marker);
  this.box(.055,4,.055,0xffef83,0,-2,0,this.marker);
  this.kites=[];
  for(let i=0;i<12;i++){
   const g=this.group(),kite=this.box(.71,.71,.065,[0xff6953,0xffd947,0xf76eca,0x32e1ec][i%4],0,0,0,g);
   kite.rotation.z=Math.PI/4;
   this.box(.065,.72,.07,0xfff6d8,0,-.60,0,g);
   for(let j=0;j<3;j++)this.box(.22,.07,.08,0xfff6d8,0,-.3-j*.22,0,g);
   this.kites.push(g);
  }
  this.market=this.group();
  for(let i=0;i<3;i++){
   const x=(i-1)*2.1;
   this.box(1.72,.78,1.19,0xfba466,x,.52,0,this.market);
   this.box(1.92,.10,1.35,0xfff2bd,x,.96,0,this.market);
   for(const side of [-1,1])this.box(.075,1.58,.075,0x824f39,x+side*.81,1.56,-.48,this.market);
   for(let j=0;j<7;j++)this.box(.27,.09,1.32,j%2?0xfff0ad:0xff5265,x+(j-3)*.27,2.35,-.02,this.market);
   for(let j=0;j<4;j++)this.box(.22,.19,.25,[0xff763e,0x82dc48,0xffe049][(i+j)%3],x+(j-1.5)*.31,1.12,.15,this.market);
  }
  this.parade=this.group();
  for(let i=0;i<5;i++){
   const x=(i-2)*.75;
   this.box(.43,.45,.31,[0xfd4e78,0xfac837,0x5faeff][i%3],x,.61,0,this.parade);
   this.box(.32,.32,.31,0xf0b58c,x,1,0,this.parade);
   this.box(.37,.12,.35,0xfff2ac,x,1.18,0,this.parade);
   this.box(.06,.85,.06,0xf6eacb,x+.3,1.18,0,this.parade);
   this.box(.44,.28,.04,0xff5a61,x+.49,1.54,0,this.parade);
  }
  this.bag=this.box(.63,.52,.39,0xb76a38,0,0,0);
  this.letters=Array.from({length:8},()=>this.box(.36,.23,.06,0xfff0bd,0,0,0));
  this.look=new T.Vector3();this.camTarget=new T.Vector3();
  const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){this.r.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix()}};
  resize();new ResizeObserver(resize).observe(canvas);
 }
 group(parent=this.scene){const g=new T.Group();parent.add(g);return g}
 material(c){if(!this.mat.has(c))this.mat.set(c,new T.MeshStandardMaterial({color:c,roughness:.78}));return this.mat.get(c)}
 box(w,h,d,c,x,y,z,parent=this.scene){const m=new T.Mesh(this.geo,this.material(c));m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m}
 ball(w,h,d,c,x,y,z){const m=new T.Mesh(new T.IcosahedronGeometry(1,1),this.material(c));m.position.set(x,y,z);m.scale.set(w,h,d);this.scene.add(m);return m}
 house(x,z,i){
  const g=this.group();g.position.set(x,terrain(x,z),z);
  this.box(3.8,2.4,3.7,[0xffdf9b,0xff8277,0x76e1cf][i%3],0,1.2,0,g);
  const roof=this.box(3.1,3.1,4.1,0xf25947,0,2.44,0,g);roof.rotation.z=Math.PI/4;roof.scale.y=1.38;
  this.box(.58,1.03,.07,0x3479a6,0,.52,1.88,g);
  for(const dx of [-1,1])this.box(.58,.53,.07,0xbff5f5,dx,1.49,1.88,g);
  return g;
 }
 draw(car,target,phase,t,dt,event){
  const x=car.x,z=car.z,y=terrain(x,z);
  this.car.position.set(x,y,z);this.car.rotation.y=-car.heading;
  this.wheels.forEach(w=>w.rotation.x-=dt*car.speed*2);
  this.sail.rotation.y=Math.sin(t*3)*.13;
  this.marker.visible=!!target&&phase==='ride';
  if(target)this.marker.position.set(target[0],terrain(...target)+4+Math.sin(t*3)*.22,target[1]);
  const intro=phase==='intro', menu=phase==='menu', show=phase==='show';
  const story=event?.time??0;
  this.bag.visible=intro;this.bag.position.set(-.7+story*.92,2.0+Math.max(0,story-.7)*1.75,-2-story*1.4);
  this.bag.rotation.z=story*3;
  this.letters.forEach((m,i)=>{
   m.visible=intro&&story>1.6;
   m.position.set(story*(i-3.5)*.55,4+Math.sin(i)*.6-Math.max(0,story-2)*.75,-4-story*(i%3+1));m.rotation.z=story+i;
  });
  this.kites.forEach((g,i)=>{
   g.visible=(intro&&i===0)||(show&&event.index!==1&&i<7)||(!intro&&!show&&i>6);
   const at=show?event.position:[9,-39];
   if(intro)g.position.copy(this.bag.position).add(new T.Vector3(0,1.25,0));
   else g.position.set(at[0]+Math.sin(t*.8+i)*4+i*.6,4+i*.42+(show?Math.min(7,story*2):0)+Math.sin(t*2+i)*.4,at[1]+Math.cos(t+i)*4);
   g.rotation.z=Math.sin(t*2+i)*.18;
  });
  this.market.visible=show&&event.index===1;
  this.parade.visible=show&&event.index===2;
  if(this.market.visible){
   const [a,b]=event.position;this.market.position.set(a,terrain(a,b),b);
   this.market.scale.y=Math.min(1,.14+story*1.65);
  }
  if(this.parade.visible){
   const [a,b]=event.position;this.parade.position.set(a-2+story*.8,terrain(a,b)+Math.abs(Math.sin(story*9))*.21,b);
  }
  this.waves.forEach((m,i)=>{m.position.y=-.12+Math.sin(t*2+i)*.008});
  if(menu||intro){
   this.camera.position.set(7-story*.75,5.2,10-story*.9);
   this.camera.lookAt(intro?this.bag.position:new T.Vector3(0,1.4,-4));
  }else if(show){
   const [a,b]=event.position;this.camera.position.set(a+8*Math.cos(story*.47),terrain(a,b)+6,b+9);
   this.camera.lookAt(a,terrain(a,b)+(event.index===1?1.4:3),b);
  }else{
   this.camTarget.set(x-Math.sin(car.heading)*6.5,y+3.9,z+Math.cos(car.heading)*6.5);
   if(this.previous!=='ride')this.camera.position.copy(this.camTarget);
   else this.camera.position.lerp(this.camTarget,1-Math.exp(-dt*6));
   this.look.set(x+Math.sin(car.heading)*8,y+1.7,z-Math.cos(car.heading)*8);
   this.camera.lookAt(this.look);
  }
  this.previous=phase;this.r.render(this.scene,this.camera);
 }
}

