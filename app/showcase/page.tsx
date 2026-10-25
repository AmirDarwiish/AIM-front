import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Play, ArrowDown } from 'lucide-react';
import Header from '@/components/construction/header';
import './showcase.css';

export const metadata = {
  title: 'LA Construction | Visual Showcase',
  description: 'A clearly labeled visual demonstration of the LA Construction architecture portfolio experience.',
};

const photography = {
  villa: 'https://images.pexels.com/photos/13752348/pexels-photo-13752348.jpeg?auto=compress&cs=tinysrgb&w=1920',
  villaGarden: 'https://images.pexels.com/photos/7031594/pexels-photo-7031594.jpeg?auto=compress&cs=tinysrgb&w=1500',
  living: 'https://images.pexels.com/photos/39828916/pexels-photo-39828916.jpeg?auto=compress&cs=tinysrgb&w=1500',
  kitchen: 'https://images.pexels.com/photos/39733052/pexels-photo-39733052.jpeg?auto=compress&cs=tinysrgb&w=1400',
  office: 'https://images.pexels.com/photos/7534234/pexels-photo-7534234.jpeg?auto=compress&cs=tinysrgb&w=1500',
  officeDetail: 'https://images.pexels.com/photos/8606292/pexels-photo-8606292.jpeg?auto=compress&cs=tinysrgb&w=1500',
  site: 'https://images.pexels.com/photos/15406034/pexels-photo-15406034.jpeg?auto=compress&cs=tinysrgb&w=1500',
  siteDetail: 'https://images.pexels.com/photos/10202865/pexels-photo-10202865.jpeg?auto=compress&cs=tinysrgb&w=1500',
};
const projects = [
  {
    slug:'residential-villa',
    category:{ar:'تصميم وتنفيذ سكني',en:'Residential construction'},
    title:{ar:'فيلا معاصرة',en:'The Modern Villa'},
    description:{ar:'تكوين معماري واضح، خامات متزنة، وتفاصيل مدروسة تحافظ على شخصية المكان.',en:'A balanced architectural language, generous spaces and careful attention to material detail.'},
    cover: photography.villaGarden,
    detail: photography.villa,
    credit: 'Max Vakhtbovych / Gustavo Galeano Maz',
  },
  {
    slug:'interior-finishing',
    category:{ar:'تشطيبات وديكور',en:'Interior finishing'},
    title:{ar:'تفاصيل تستحق الاهتمام',en:'Considered Interiors'},
    description:{ar:'ملمس هادئ، إضاءة طبيعية، وتوزيع يوازن بين الوظيفة وجمال التفاصيل.',en:'Thoughtful materiality, natural light and a balance of comfort and craft.'},
    cover:photography.living,
    detail:photography.kitchen,
    credit:'shaza jocarlos',
  },
  {
    slug:'office-fitout',
    category:{ar:'تجهيز مساحات العمل',en:'Office fit-out'},
    title:{ar:'مساحات للعمل بوضوح',en:'A Better Place to Work'},
    description:{ar:'مساحات عملية قابلة للتطور، مع حلول تشطيب تتكيف مع احتياجات الفرق.',en:'Flexible, elegant workplace environments designed around how teams collaborate.'},
    cover:photography.office,
    detail:photography.officeDetail,
    credit:'Max Vakhtbovych / Ryan Pilato',
  },
  {
    slug:'site-execution',
    category:{ar:'مقاولات وإنشاءات',en:'Construction delivery'},
    title:{ar:'من الفكرة إلى التنفيذ',en:'The Art of Building'},
    description:{ar:'تنظيم مراحل التنفيذ، متابعة جودة الأعمال، والاهتمام بكل مرحلة إنشائية.',en:'A disciplined approach to the building process, from site preparation to completion.'},
    cover:photography.site,
    detail:photography.siteDetail,
    credit:'Ulrick Trappschuh / This Viktọ',
  },
] as const;

export default async function Showcase({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const en = (await searchParams).lang === 'en';
  const lang = en ? 'en' : 'ar';
  const t = <T,>(text: {ar:T;en:T}) => text[lang];

  return (
    <div className="la-site la-showcase" lang={lang} dir={en ? 'ltr' : 'rtl'}>
      <a className="la-skip" href="#main">{en ? 'Skip to content' : 'انتقل للمحتوى'}</a>
      <Header lang={lang} />
      <main id="main">
        <section className="la-showcase-hero" aria-labelledby="showcase-heading">
          <img
            src={photography.villa}
            alt={en ? 'Contemporary villa architecture — reference photography' : 'فيلا معاصرة — صورة معمارية مرجعية'}
            width={1920} height={1280} fetchPriority="high"
          />
          <div className="la-showcase-hero-tint" aria-hidden="true" />
          <div className="la-wrap la-showcase-hero-inner">
            <div className="la-showcase-index">
              <span>LA CONSTRUCTION</span>
              <span>VISUAL STUDY / 001</span>
            </div>
            <div className="la-showcase-hero-content">
              <span className="la-eyebrow">{en ? 'Designed to endure' : 'فلسفة بناء مختلفة'}</span>
              <h1 id="showcase-heading">
                {en ? <>Where precision<br/>meets possibility.</> : <>نبني التفاصيل.<br/>لنصنع الفرق.</>}
              </h1>
              <p>{en ? 'An editorial direction for construction, interiors and the spaces that shape everyday life.' : 'رؤية معمارية تجمع بين دقة التنفيذ وجمال التفاصيل لتقديم مساحات تستحق أن تدوم.'}</p>
              <a className="la-showcase-hero-cta" href="#portfolio">
                {en ? 'Explore the visual portfolio' : 'استكشف الأعمال المرجعية'}
                <ArrowDownRight size={20} aria-hidden="true"/>
              </a>
            </div>
            <div className="la-showcase-bottomline">
              <span>{en ? 'VISUAL DEMONSTRATION • NOT COMPANY PROJECTS' : 'معاينة بصرية • الصور ليست من أعمال الشركة'}</span>
              <a href="#portfolio" aria-label={en?'Scroll down':'انتقل للمشاريع'}><ArrowDown size={20}/></a>
            </div>
          </div>
        </section>

        <section className="la-showcase-notice la-wrap" aria-label={en?'Demo disclaimer':'تنويه المعاينة'}>
          <span className="la-showcase-notice-mark" aria-hidden="true">01 /</span>
          <p>{en ? 'This is a visual design showcase with licensed reference photography and video — it does not represent completed LA Construction commissions. Production pages remain driven by your CMS.' : 'دي معاينة للتصميم بصور وفيديوهات مرجعية مرخصة، وليست مشاريع منفذة باسم LA Construction. صفحات الموقع الأساسية تفضل مرتبطة بالـ CMS.'}</p>
        </section>

        <section className="la-wrap la-showcase-intro" aria-labelledby="showcase-intro-title">
          <div>
            <span className="la-eyebrow">{en?'Our approach':'فلسفتنا'}</span>
            <h2 id="showcase-intro-title">{en ? <>We believe every<br/>space tells a story.</> : <>لكل مساحة قصة.<br/>ولكل تفصيلة معنى.</>}</h2>
          </div>
          <div>
            <p>{en ? 'Material, light and proportion are more than design decisions. Together, they form a distinct experience of place — from first sketch to final finish.' : 'اختيار الخامات، حركة الضوء، والنسب المعمارية مش مجرد قرارات شكلية. كل عنصر بيكمل رؤية متكاملة من أول الفكرة لحد آخر لمسة.'}</p>
            <Link href={`/about?lang=${lang}`} className="la-text-link">
              {en?'Discover LA Construction':'تعرف على الشركة'} <ArrowUpRight size={19}/>
            </Link>
          </div>
        </section>

        <section className="la-showcase-portfolio" id="portfolio" aria-labelledby="showcase-portfolio-heading">
          <div className="la-wrap">
            <div className="la-showcase-section-top">
              <div>
                <span className="la-eyebrow">{en?'Selected visual studies':'مختارات للمعاينة'}</span>
                <h2 id="showcase-portfolio-heading">{en ? 'Built around experience.' : 'مساحات برؤية مختلفة.'}</h2>
              </div>
              <span className="la-showcase-counter">01 — 04</span>
            </div>
            <div className="la-showcase-grid">
              {projects.map((project,index)=>(
                <article className="la-showcase-project" id={project.slug} key={project.slug}>
                  <div className="la-showcase-photo">
                    <img src={project.cover} alt={t(project.title)} width={1400} height={1100} loading="lazy" decoding="async"/>
                    <span className="la-showcase-photo-number">{String(index+1).padStart(2,'0')}</span>
                  </div>
                  <div className="la-showcase-project-meta"><span>{t(project.category)}</span><span>LA / 0{index+1}</span></div>
                  <h3>{t(project.title)}</h3>
                  <p>{t(project.description)}</p>
                  <details className="la-showcase-details">
                    <summary>{en?'View another angle':'شاهد زاوية تانية'} <ArrowUpRight size={17}/></summary>
                    <img src={project.detail} alt={t(project.title)} width={1200} height={900} loading="lazy"/>
                    <p>{en?'Reference photography, not a completed LA Construction project.':'صورة مرجعية للمعاينة، مش من المشاريع المنفذة للشركة.'}</p>
                  </details>
                  <span className="la-showcase-credit">{en?'Photography':'التصوير'}: {project.credit} / Pexels</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="la-showcase-film" aria-labelledby="showcase-film-heading">
          <div className="la-wrap">
            <div className="la-showcase-section-top">
              <div>
                <span className="la-eyebrow">{en?'Motion & material':'من قلب مواقع العمل'}</span>
                <h2 id="showcase-film-heading">{en?'A process in motion.':'البناء.. حكاية في كل مرحلة.'}</h2>
              </div>
              <Play size={32} strokeWidth={1} aria-hidden="true"/>
            </div>
            <div className="la-showcase-video-layout">
              <div className="la-showcase-video">
                <video controls playsInline preload="none" poster={photography.siteDetail} aria-label={en?'Building site footage from Wikimedia Commons':'فيديو مرجعي من موقع بناء'}>
                  <source src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Men_at_work_in_building_site.webm" type="video/webm"/>
                  {en?'Your browser does not support this video.':'المتصفح لا يدعم تشغيل الفيديو.'}
                </video>
              </div>
              <aside className="la-showcase-video-copy">
                <span>FILM / 001</span>
                <h3>{en?'Craft begins on site.':'التنفيذ يبدأ من التفاصيل.'}</h3>
                <p>{en?'Real construction footage licensed CC0 by Akum20, used solely to demonstrate the film component.' : 'فيديو حقيقي لموقع بناء من تصوير Akum20 بترخيص CC0، مستخدم فقط لمعاينة شكل الفيديو في الموقع.'}</p>
                <a href="https://commons.wikimedia.org/wiki/File:Men_at_work_in_building_site.webm" target="_blank" rel="noopener noreferrer">
                  {en?'Footage source':'مصدر الفيديو'} <ArrowUpRight size={16}/>
                </a>
                <a href="https://www.pexels.com/video/large-construction-site-with-cranes-and-building-30810393/" target="_blank" rel="noopener noreferrer">
                  {en?'More reference footage':'فيديو مرجعي إضافي'} <ArrowUpRight size={16}/>
                </a>
              </aside>
            </div>
          </div>
        </section>

        <section className="la-showcase-final">
          <div className="la-wrap">
            <span className="la-eyebrow">{en?'The next step':'الخطوة القادمة'}</span>
            <h2>{en?'Let the real projects tell the story.':'المشاريع الحقيقية هي اللي بتحكي القصة.'}</h2>
            <p>{en?'Replace the reference assets with licensed photography from LA Construction projects through the existing media and project APIs.' : 'بعد اعتماد الشكل، نربط الصور والفيديوهات الفعلية لأعمال LA Construction من خلال الـ CMS والـ API الحاليين.'}</p>
            <Link href={`/?lang=${lang}`} className="la-button">{en?'Back to the live website':'ارجع للموقع الأساسي'} <ArrowUpRight size={19}/></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
