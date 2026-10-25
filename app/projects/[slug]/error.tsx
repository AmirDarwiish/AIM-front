'use client';
export default function Error({reset}:{reset:()=>void}){return <main className="la-site la-wrap la-empty" dir="rtl"><h1>تعذر تحميل المشروع</h1><p>حاول مرة أخرى بعد قليل.</p><button className="la-button la-button-dark" onClick={reset}>إعادة المحاولة</button><a href="/projects">كل المشاريع</a></main>}
