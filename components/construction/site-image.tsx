import Image, { getImageProps, type ImageProps } from 'next/image';

/** Responsive CMS photographs; external third-party covers keep their existing URL. */
function canOptimize(props:ImageProps){
  const src=props.src;
  let optimize=typeof src!=='string'||(src.startsWith('/')&&!src.startsWith('//'));
  if(typeof src==='string'&&!optimize){
    try{const url=new URL(src);optimize=url.origin==='https://aim.runasp.net'&&url.pathname.startsWith('/uploads/')&&!url.search;}catch{}
  }
  return optimize;
}
export function responsiveImageProps(props:ImageProps){
  return getImageProps({...props,unoptimized:props.unoptimized||!canOptimize(props)}).props;
}
export default function SiteImage(props: ImageProps) {
  return <Image {...props} unoptimized={props.unoptimized||!canOptimize(props)}/>;
}
