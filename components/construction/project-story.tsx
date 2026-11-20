import {projectChapters} from '@/lib/portfolio-content';
import type {Project} from '@/lib/construction';
import type {Lang} from '@/lib/public-api';
import Gallery from './gallery';
export default function ProjectStory({project,assets,previewAssets,lang}:{project:Project;assets:NonNullable<Project['assets']>;previewAssets:NonNullable<Project['assets']>;lang:Lang}){
 const chapters=projectChapters(project,assets,lang);
 return <div className="la-project-story">{chapters.map((chapter,index)=><section className="la-project-chapter" key={chapter.assets[0]?.id??index} data-story-chapter={index+1}><div className="la-chapter-copy"><h2>{chapter.title}</h2><p>{chapter.description}</p></div><Gallery assets={chapter.assets} previewAssets={previewAssets} lang={lang} showCaptions={new Set(chapter.assets.map(a=>a.caption).filter(Boolean)).size>1}/></section>)}</div>;
}
