import type {PointerEvent} from 'react';
/** Small pointer-only tilts. Touch remains available for horizontal carousel swipes. */
export function moveSpatialSurface(event:PointerEvent<HTMLElement>){
 if(event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const el=event.currentTarget,rect=el.getBoundingClientRect();
 el.style.setProperty('--surface-x',`${((event.clientY-rect.top)/rect.height-.5)*-6}deg`);
 el.style.setProperty('--surface-y',`${((event.clientX-rect.left)/rect.width-.5)*8}deg`);
}
export function resetSpatialSurface(event:PointerEvent<HTMLElement>){
 event.currentTarget.style.removeProperty('--surface-x');event.currentTarget.style.removeProperty('--surface-y');
}
