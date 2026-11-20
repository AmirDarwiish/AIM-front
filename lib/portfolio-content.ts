import type {Project} from './construction';
import type {Lang} from './public-api';

/** Service IDs belong to the existing CMS; explicit links survive renamed categories. */
const relationships:Record<number,{slugs:string[];categories:string[]}>= {
 27:{slugs:['al-amir','purity','m-residential-building'],categories:['construction works','أعمال إنشائية','مقاولات وإنشاءات']},
 28:{slugs:['ap-apartment'],categories:['interior finishing','تشطيبات داخلية','تشطيبات وديكور']},
 29:{slugs:[],categories:['interior design','interior design & décor','تصميم داخلي','ديكور وتصميم داخلي']},
 43:{slugs:['mep-site-works'],categories:['mechanical & electrical works','أعمال كهروميكانيكية','mep']},
 44:{slugs:[],categories:['project management','إدارة المشاريع','إشراف هندسي']},
};
const normalize=(s:string)=>s.trim().toLocaleLowerCase().replace(/\s+/g,' ');
export function projectsForService(serviceId:number,projects:Project[]):Project[]{
 const relation=relationships[serviceId];if(!relation)return [];
 return projects.filter(p=>relation.slugs.includes(p.slug)||relation.categories.some(category=>normalize(category)===normalize(p.category||'')));
}
export function servicesForProject(project:Project):number[]{return Object.keys(relationships).map(Number).filter(id=>projectsForService(id,[project]).length>0)}
type ChapterCopy={ar:[string,string];en:[string,string]};
const chapters:Record<string,ChapterCopy[]>={
 'al-amir':[
  {ar:['من الأرض تبدأ التفاصيل','لقطات لأعمال الحفر وتجهيز الأساسات وتسليح العناصر الخرسانية في الموقع.'],en:['Groundwork and preparation','Site photographs show excavation, foundation preparation and reinforcement of concrete elements.']},
  {ar:['تقدّم الأعمال الخرسانية','مشاهد من الصب والهيكل الخرساني، إلى جانب أجزاء مختلفة من المباني أثناء التنفيذ.'],en:['Concrete work in progress','Concrete placement and structural work are shown alongside different areas of the buildings during execution.']},
  {ar:['الهيكل والمباني وأعمال الموقع','صور تجمع تفاصيل المباني والأعمال الخرسانية وتجهيز أجزاء من الموقع.'],en:['Structure, masonry and site work','A closer look at masonry, concrete elements and the preparation of different site areas.']},
  {ar:['المساحات والواجهات','زوايا داخلية وخارجية توضح المساحات المنفذة وحالة المباني وقت التصوير.'],en:['Spaces and elevations','Interior and exterior views document the built spaces and the state of the buildings when photographed.']},
  {ar:['تفاصيل مكملة للتنفيذ','لقطات إضافية للعناصر الخرسانية والأعمال الخارجية وتجهيزات التنفيذ بالموقع.'],en:['Further site details','Additional views of concrete elements, external works and construction preparations on site.']},
 ],
 'purity':[
  {ar:['تجهيز الأساسات وأعمال الصب','توثيق لتجهيز العناصر الخرسانية وتسليحها والعمل أثناء الصب.'],en:['Foundations and concrete placement','The photographs record preparation, reinforcement and concrete placement on site.']},
  {ar:['من الأساسات إلى الهيكل','لقطات من الموقع توضح الأعمال الخرسانية والأعمدة في مراحل مختلفة من التنفيذ.'],en:['From foundations to the structure','Site views document concrete works and columns at different stages of execution.']},
  {ar:['رؤية أشمل للمبنى','لقطات أرضية وعلوية للهيكل والمباني وتفاصيل العناصر المنفذة.'],en:['A broader view of the building','Ground-level and overhead photographs show the structure, masonry and executed details.']},
 ],
 'ap-apartment':[
  {ar:['تجهيز الحوائط والمحارة','صور من أعمال تجهيز الأسطح وتنفيذ المحارة داخل الوحدة السكنية.'],en:['Wall preparation and plastering','Photographs show surface preparation and plastering inside the apartment.']},
  {ar:['تفاصيل الفراغات أثناء التنفيذ','الغرف والممرات في مرحلة المحارة والتأسيس، قبل الدهانات والتشطيبات النهائية.'],en:['Interior spaces during execution','Rooms and circulation areas are shown during plastering and first fix, ahead of painting and final finishes.']},
 ],
 'mep-site-works':[
  {ar:['التأسيس داخل المباني','نماذج لتمديدات الكهرباء وأعمال تأسيس السباكة داخل الفراغات.'],en:['First-fix installations','Examples of electrical conduits and plumbing first fix inside the buildings.']},
  {ar:['التمديدات والشبكات الخارجية','لقطات من أعمال مد المواسير وشبكات الصرف خارج المباني.'],en:['External pipework and networks','Site photographs document pipework and drainage networks outside the buildings.']},
  {ar:['غرف التفتيش وربط الشبكات','تفاصيل لغرف التفتيش والعناصر المرتبطة بمسارات المواسير والصرف.'],en:['Inspection chambers and connections','Details of inspection chambers and elements associated with pipework and drainage routes.']},
 ],
};
export function projectChapters(project:Project,assets:NonNullable<Project['assets']>,lang:Lang){
 const groups:NonNullable<Project['assets']>[]=[];
 for(let start=0;start<assets.length;start+=4)groups.push(assets.slice(start,start+4));
 if(groups.length>1&&groups.at(-1)!.length===1)groups[groups.length-2].push(...groups.pop()!);
 return groups.map((items,index)=>{
  const copy=chapters[project.slug]?.[index]?.[lang];
  return {assets:items,title:copy?.[0]||(lang==='en'?'From the site':'من تفاصيل الموقع'),description:copy?.[1]||(lang==='en'?'Photographs document the work as it appeared on site, with details of the executed elements.':'صور توثّق حالة الأعمال بالموقع وتفاصيل العناصر المنفذة وقت التصوير.')};
 });
}
