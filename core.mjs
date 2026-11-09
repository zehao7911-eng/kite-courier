export const jobs=[
 {name:'Lighthouse invitation',pick:[12,-18],drop:[-20,-43],event:'THE LIGHTHOUSE KITES ARE UP!'},
 {name:'Market recipe',pick:[27,-9],drop:[28,-46],event:'THE MARKET IS OPEN!'},
 {name:'Festival pennant',pick:[3,-68],drop:[9,-39],event:'THE FESTIVAL TAKES FLIGHT!'}
];
export function terrain(x,z){
 const inland=Math.min(1,Math.max(0,(x+29)/32));
 return inland*(1.2+1.2*Math.sin(z*.045)+.85*Math.sin(x*.075-z*.02));
}
export function advance(car,turn,dt){
 car.heading+=turn*1.95*dt;
 const x=car.x+Math.sin(car.heading)*car.speed*dt,z=car.z-Math.cos(car.heading)*car.speed*dt;
 if(x<-32||x>60||z<-98||z>30){
  car.heading=Math.atan2(-car.x,car.z+30);
 }else{car.x=x;car.z=z}
}
