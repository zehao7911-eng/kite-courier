import {jobs,advance} from './core.mjs';
import {Coast} from './view.mjs';
import {Music} from './audio.mjs';
import {BeaconHost} from './sdk.mjs';
const $=id=>document.getElementById(id),canvas=document.querySelector('canvas');
const key='kite-courier-v1';
function clean(s){return {game:'kite-courier',v:1,done:jobs.map((_,i)=>s?.done?.[i]===true),sound:s?.sound!==false}}
let saved;try{saved=clean(JSON.parse(localStorage.getItem(key)))}catch{saved=clean()}
const music=new Music();music.enabled=saved.sound;
const host=new BeaconHost(window,{load(value){const remote=clean(value);saved.done=saved.done.map((v,i)=>v||remote.done[i]);save()}});
function save(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{}host.save(saved)}
const car={x:0,z:0,heading:0,speed:9.1};
let world,phase='menu',story=0,job=0,carrying=false,pointer=null,turn=0,keyTurn=0,event=null,captionTime=0;
function caption(value,duration){$('caption').textContent=value;captionTime=duration}
function ride(){
 if(phase!=='intro')return;
 phase='ride';$('skip').hidden=true;$('hud').hidden=false;$('tip').hidden=false;
 caption('FOLLOW THE GOLD MAIL BEACON',2.4);music.mode='dive';host.start();
}
function begin(){
 if(!world)return;
 job=saved.done.findIndex(v=>!v);
 if(job<0)job=0;
 carrying=false;Object.assign(car,{x:0,z:0,heading:0});
 phase='intro';story=0;event=null;$('panel').hidden=true;$('skip').hidden=false;$('hud').hidden=true;
 music.mode='chute';music.start();caption('THAT KITE HAS THE MAIL!',3.8);
}
$('go').onclick=begin;$('skip').onclick=ride;
$('sound').onclick=()=>{music.toggle();saved.sound=music.enabled;$('sound').setAttribute('aria-pressed',String(saved.sound));save()};
$('sound').setAttribute('aria-pressed',String(saved.sound));
canvas.addEventListener('pointerdown',e=>{
 if(phase!=='ride'||pointer)return;
 pointer={id:e.pointerId,start:e.clientX};canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{if(pointer?.id===e.pointerId)turn=Math.max(-1,Math.min(1,(e.clientX-pointer.start)/52))});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(pointer?.id===e.pointerId){pointer=null;turn=0}});
addEventListener('keydown',e=>{if(phase==='ride'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();keyTurn=e.key==='ArrowLeft'?-1:1}});
addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key))keyTurn=0});
try{world=new Coast(canvas)}catch{$('title').textContent='3D unavailable';$('detail').textContent='Please use a WebGL-enabled browser.';$('go').disabled=true}
let last=performance.now();
function tick(now){
 const dt=Math.min(.05,(now-last)/1000);last=now;
 if(document.hidden){requestAnimationFrame(tick);return}
 story+=dt;
 if(phase==='intro'&&story>4.4)ride();
 const mission=jobs[job],target=carrying?mission.drop:mission.pick;
 if(phase==='ride'){
  advance(car,turn||keyTurn,dt);
  const dx=target[0]-car.x,dz=target[1]-car.z,dist=Math.hypot(dx,dz);
  $('objective').textContent=(carrying?'DELIVER: ':'FIND: ')+mission.name;
  $('distance').textContent=Math.round(dist)+' m · '+(job+1)+' / '+jobs.length;
  $('arrow').style.transform='rotate('+(Math.atan2(dx,-dz)-car.heading)+'rad)';
  if(dist<3){
   if(!carrying){carrying=true;caption('MAIL FOUND!',1.6);music.hit(1)}
   else{
    saved.done[job]=true;save();phase='show';story=0;pointer=null;turn=keyTurn=0;
    event={position:mission.drop,time:0,index:job};caption(mission.event,3.5);music.hit(4);$('hud').hidden=true;$('tip').hidden=true;
   }
  }
 }else if(phase==='show'){
  event.time=story;
  if(story>4){
   carrying=false;
   if(job<jobs.length-1){job++;phase='ride';$('hud').hidden=false;$('tip').hidden=false}
   else{
    phase='result';host.end();$('title').textContent='All mail delivered.';
    $('detail').textContent='The festival is underway. Take another ride around Gale Bay.';
    $('go').textContent='RIDE AGAIN ↗';$('panel').hidden=false;
   }
  }
 }
 captionTime-=dt;if(captionTime<=0)$('caption').textContent='';
 world?.draw(car,target,phase,now/1000,dt,phase==='intro'?{time:story}:event);
 requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){pointer=null;turn=keyTurn=0;save();music.context?.suspend().catch(()=>{})}
 else if(music.enabled&&music.context)music.context.resume().catch(()=>{});
});
addEventListener('pagehide',()=>{save();host.stop();music.stop()});
addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
host.poll();requestAnimationFrame(tick);
