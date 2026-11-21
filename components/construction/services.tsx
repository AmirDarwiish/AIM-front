import SiteImage from './site-image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { imageUrl } from '@/lib/construction';
import { serviceImage } from '@/lib/service-images';
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
        const href = `/services/${item.id}?lang=${lang}#service-projects`;
        const image = imageUrl(serviceImage(item));
        return (
          <article key={item.id}>
            {!expanded?<Link className="la-service-model" href={href} aria-label={item.title}>{image?<SiteImage src={image} alt={item.title} width={1000} height={750} sizes="(max-width:760px) 90vw, (max-width:1100px) 46vw, 32vw" loading="lazy" decoding="async"/>:<ArchitectureScene kind={(['structure','interior','terraces'] as SceneKind[])[index%3]}/>}</Link>:image && (
              <Link
                className={expanded ? 'la-service-cover' : 'la-service-thumb'}
                href={href}
                aria-label={item.title}
              >
                <SiteImage src={image} alt="" width={1000} height={700} sizes="(max-width:760px) 90vw, 46vw" loading="lazy" decoding="async" />
              </Link>
            )}
            <div className="la-service-copy">
              <Heading><Link href={href}>{item.title}</Link></Heading>
              {item.description && <p>{item.description}</p>}
              <Link className="la-text-link" href={href}>
                {lang === 'en' ? 'Service & related work' : 'الخدمة وسابقة الأعمال'}
                <ArrowUpRight size={19} />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
