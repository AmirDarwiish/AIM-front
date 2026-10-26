'use client';
import {moveSpatialSurface,resetSpatialSurface} from '@/lib/spatial-interaction';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { imageUrl } from '@/lib/construction';
import ArchitectureScene,{type SceneKind} from './architecture-scene';
import type { Item, Lang } from '@/lib/public-api';

/** One component powers both the homepage and the full service catalogue. */
export default function Services({
  items,
  lang,
  expanded = false,
}: {
  items: Item[];
  lang: Lang;
  expanded?: boolean;
}) {
  const Heading=expanded?'h2':'h3';
  return (
    <div className={expanded ? 'la-services-catalogue' : 'la-service-grid'}>
      {items.map((item,index) => {
        const href = `/services/${item.id}?lang=${lang}`;
        const image = imageUrl(item.imageUrl);
        return (
          <article key={item.id} onPointerMove={moveSpatialSurface} onPointerLeave={resetSpatialSurface}>
            {!expanded?<Link className="la-service-model" href={href} aria-label={item.title}><ArchitectureScene kind={(['structure','interior','terraces'] as SceneKind[])[index%3]}/></Link>:image && (
              <Link
                className={expanded ? 'la-service-cover' : 'la-service-thumb'}
                href={href}
                aria-label={item.title}
              >
                <img src={image} alt="" width="1000" height="700" loading="lazy" decoding="async" />
              </Link>
            )}
            <div className="la-service-copy">
              <Heading><Link href={href}>{item.title}</Link></Heading>
              {item.description && <p>{item.description}</p>}
              <Link className="la-text-link" href={href}>
                {lang === 'en' ? 'Explore this service' : 'تفاصيل الخدمة'}
                <ArrowUpRight size={19} />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
