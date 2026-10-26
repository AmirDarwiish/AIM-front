import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { imageUrl, type Project } from '@/lib/construction';
import type { Lang } from '@/lib/public-api';

/** Editorial portfolio grid. All content and image URLs still come from the public API. */
export default function Projects({
  items,
  lang,
  featured = false,
}: {
  items: Project[];
  lang: Lang;
  featured?: boolean;
}) {
  return (
    <div className={`la-project-grid ${featured ? 'la-featured-grid' : ''}`} data-count={items.length}>
      {items.map((project, index) => {
        const cover = imageUrl(project.coverUrl);
        return (
          <Link
            href={`/projects/${encodeURIComponent(project.slug)}?lang=${lang}`}
            className="la-project-card"
            key={project.id}
          >
            <div className="la-project-image">
              {cover ? (
                <img
                  src={cover}
                  alt={project.title}
                  width="1200"
                  height="900"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="la-project-placeholder">LA / {String(index + 1).padStart(2, '0')}</span>
              )}
              <span className="la-project-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="la-project-arrow" aria-hidden="true">
                <ArrowUpRight size={23} />
              </span>
            </div>
            <div className="la-project-meta">
              <span>{project.category}</span>
              <span>{project.year}</span>
            </div>
            <h3>{project.title}</h3>
            {project.summary && <p className="la-project-summary">{project.summary}</p>}
            {project.location && <p>{project.location}</p>}
          </Link>
        );
      })}
    </div>
  );
}
