'use client';
import {useId,type PointerEvent} from 'react';
export type SceneKind='courtyard'|'structure'|'interior'|'terraces';
type Point=[number,number,number];
const point=([x,y,z]:Point)=>`${(240+x-y).toFixed(1)},${(270+(x+y)*.44-z).toFixed(1)}`;
const polygon=(points:Point[])=>points.map(point).join(' ');
function Volume({x,y,w,d,h,z=0,tone='stone'}:{x:number;y:number;w:number;d:number;h:number;z?:number;tone?:'stone'|'bronze'|'dark'}){
 const colors={stone:['#f7f3e8','#ddd6c5','#a9a99b'],bronze:['#d5bb91','#ab885d','#735c43'],dark:['#52665b','#34493f','#1c3029']}[tone];
 return <g stroke="#192c2318" strokeWidth=".6" strokeLinejoin="round">
  <polygon points={polygon([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]])} fill={colors[1]}/>
  <polygon points={polygon([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]])} fill={colors[2]}/>
  <polygon points={polygon([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]])} fill={colors[0]}/>
 </g>;
}
function Model({kind}:{kind:SceneKind}){
 return <>
  <Volume x={-104} y={-80} w={208} d={160} h={10} tone="stone"/>
  {kind==='courtyard'?<>
   <Volume x={-84} y={-60} w={168} d={42} h={84} z={10}/>
   <Volume x={-84} y={-18} w={42} d={76} h={58} z={10}/>
   <Volume x={42} y={-18} w={42} d={76} h={58} z={10} tone="dark"/>
   <Volume x={-30} y={-5} w={60} d={58} h={3} z={10} tone="dark"/>
   <Volume x={-88} y={-64} w={176} d={50} h={7} z={106} tone="bronze"/>
   {[-30,0,30,60].map(x=><Volume key={x} x={x} y={-17} w={3} d={2} h={54} z={10} tone="bronze"/>)}
   <polygon points={polygon([[-37,-16,16],[78,-16,16],[78,-16,63],[-37,-16,63]])} fill="#627b6e" opacity=".7"/>
  </>:kind==='structure'?<>
   {[-75,0,75].map(x=>[-48,48].map(y=><Volume key={`${x}-${y}`} x={x} y={y} w={10} d={10} h={102} z={10}/>))}
   <Volume x={-82} y={-54} w={174} d={116} h={8} z={58}/>
   <Volume x={-82} y={-54} w={174} d={116} h={8} z={123} tone="bronze"/>
   <Volume x={-65} y={15} w={50} d={38} h={30} z={10} tone="dark"/>
  </>:kind==='interior'?<>
   <Volume x={-85} y={-60} w={170} d={9} h={95} z={10}/>
   <Volume x={-85} y={-51} w={9} d={112} h={95} z={10}/>
   <Volume x={-57} y={-39} w={118} d={23} h={28} z={10} tone="bronze"/>
   <Volume x={-42} y={10} w={88} d={42} h={25} z={10} tone="dark"/>
   <Volume x={-45} y={7} w={94} d={48} h={5} z={35} tone="stone"/>
   <Volume x={55} y={22} w={16} d={30} h={40} z={10} tone="bronze"/>
  </>:<>
   <Volume x={-78} y={-57} w={72} d={112} h={82} z={10} tone="dark"/>
   <Volume x={-6} y={-57} w={48} d={112} h={55} z={10}/>
   <Volume x={42} y={-57} w={42} d={112} h={28} z={10} tone="bronze"/>
   <Volume x={-84} y={-63} w={84} d={124} h={5} z={107} tone="bronze"/>
   <Volume x={-8} y={-61} w={54} d={120} h={5} z={72}/>
  </>}
 </>;
}
export default function ArchitectureScene({kind='courtyard',className=''}:{kind?:SceneKind;className?:string}){
 const id=useId().replace(/:/g,'');
 function move(event:PointerEvent<HTMLDivElement>){
  if(event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const el=event.currentTarget,rect=el.getBoundingClientRect();
  el.style.setProperty('--scene-x',`${((event.clientY-rect.top)/rect.height-.5)*-8}deg`);
  el.style.setProperty('--scene-y',`${((event.clientX-rect.left)/rect.width-.5)*10}deg`);
 }
 function reset(event:PointerEvent<HTMLDivElement>){event.currentTarget.style.removeProperty('--scene-x');event.currentTarget.style.removeProperty('--scene-y')}
 return <div className={`la-architecture-scene ${className}`} aria-hidden="true" onPointerMove={move} onPointerLeave={reset}>
  <svg viewBox="0 0 480 370" fill="none" focusable="false">
   <defs><filter id={`shadow-${id}`} x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="13"/></filter><linearGradient id={`ground-${id}`} x1="120" y1="100" x2="320" y2="370" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".5"/><stop offset="1" stopColor="#acb7a4" stopOpacity=".18"/></linearGradient></defs>
   <ellipse cx="252" cy="289" rx="151" ry="36" fill="#0a201d" opacity=".24" filter={`url(#shadow-${id})`}/>
   <polygon points="28,269 237,174 455,269 245,364" fill={`url(#ground-${id})`}/>
   <g className="la-architecture-model"><Model kind={kind}/></g>
  </svg>
 </div>;
}
