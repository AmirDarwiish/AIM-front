import Gallery from './gallery';
import type { Lang } from '@/lib/public-api';
/** Shared uncropped photo with the same accessible viewer as project galleries. */
export default function PhotoPreview({src,alt,lang}:{src:string;alt:string;lang:Lang}){
 return <Gallery assets={[{id:0,kind:'image',url:src,caption:alt}]} lang={lang} inline/>;
}
