import type { Lang } from './public-api';
/** Physical arrow keys follow the reading direction of the gallery. */
export function galleryKeyStep(key:string,lang:Lang):number{
 if(key==='ArrowRight')return lang==='ar'?-1:1;
 if(key==='ArrowLeft')return lang==='ar'?1:-1;
 return 0;
}
export function gallerySwipeStep(dx:number,dy:number,lang:Lang):number{
 if(Math.abs(dx)<48||Math.abs(dx)<=Math.abs(dy))return 0;
 return (dx>0?1:-1)*(lang==='ar'?1:-1);
}
