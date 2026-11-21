"""Build the Arabic institutional portfolio from supplied company photographs.

Dependencies: reportlab, Pillow, arabic-reshaper, python-bidi,
qrcode, uharfbuzz. Run from the repository root; output is public/documents/LA-Construction-Portfolio.pdf.
"""
from pathlib import Path
from io import BytesIO
import json
import re
from PIL import Image, ImageOps
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont, shapeStr
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
import qrcode

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'public/documents/LA-Construction-Portfolio.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
DATA = json.loads((ROOT/'lib/company-content.json').read_text())
for name, file in [('Regular','Arabic-Regular.ttf'),('Medium','Arabic-SemiBold.ttf'),('Bold','Arabic-SemiBold.ttf')]:
    pdfmetrics.registerFont(TTFont('Company'+name, str(ROOT/'public/assets'/file)))

W, H, M = 595.276, 841.89, 42
CW = W-2*M
INK, MUTED, PAPER, LINE = '#20262a', '#596166', '#f6f5f1', '#d6d9d7'
C = canvas.Canvas(str(OUT), pagesize=(W,H), pageCompression=1)
C.setTitle('LA Construction | Company Portfolio')
C.setAuthor('LA Construction')
C.setSubject('Integrated construction, finishing and engineering: company profile and selected works')
C.setCreator('LA Construction')
C.setViewerPreference('DisplayDocTitle', 'true')
PAGE = 0
IMAGE_CACHE = {}
CONTENT_BOUNDS = []

def color(value):
    if len(value)==4: value='#'+''.join(c*2 for c in value[1:])
    return HexColor(value)
def rect(x,y,w,h,fill,stroke=None):
    C.setFillColor(color(fill))
    if stroke: C.setStrokeColor(color(stroke))
    C.rect(x,H-y-h,w,h,fill=1,stroke=bool(stroke))
def rule(x,y,w,stroke=LINE):
    C.setStrokeColor(color(stroke));C.setLineWidth(.6);C.line(x,H-y,x+w,H-y)
def visual(t): return get_display(arabic_reshaper.reshape(str(t)))
def ar(t,x,y,size=12,font='Regular',fill=INK):
    C.setFillColor(color(fill));C.setFont('Company'+font,size)
    C.drawRightString(x,H-y-size*.85,visual(t))
def en(t,x,y,size=9,font='Helvetica',fill=MUTED):
    C.setFillColor(color(fill));C.setFont(font,size);C.drawString(x,H-y-size*.85,str(t))
def para(t,x,y,w,size=13,leading=None,fill=MUTED,font='Regular'):
    leading = leading or size*1.55
    yy=y
    for paragraph in str(t).split('\n'):
        if not paragraph.strip(): yy+=leading*.5;continue
        line=''
        for word in paragraph.split():
            candidate=(line+' '+word).strip()
            if line and pdfmetrics.stringWidth(visual(candidate),'Company'+font,size)>w:
                ar(line,x+w,yy,size,font,fill);yy+=leading;line=word
            else: line=candidate
        if line: ar(line,x+w,yy,size,font,fill);yy+=leading
    CONTENT_BOUNDS.append((PAGE,yy))
    return yy
def logo(x,y,size=38,fill=INK,wordmark=True):
    # The supplied LA monogram, traced from the site's vector mark.
    C.saveState();C.translate(x,H-y-size*1.1);C.scale(size/100,size/100)
    C.setFillColor(color(fill))
    for pts in [[(13,102),(35,102),(31,98),(31,35),(65,35),(65,30),(17,30),(17,97)],[(61,81),(98,7),(78,7),(53,61),(26,7),(17,7)]]:
        p=C.beginPath();p.moveTo(*pts[0])
        for pt in pts[1:]:p.lineTo(*pt)
        p.close();C.drawPath(p,fill=1,stroke=0)
    C.restoreState()
    if wordmark: en('LA CONSTRUCTION',x+size+12,y+size*.42,10,'Helvetica-Bold',fill)
def photo(key,x,y,w,h,mode='cover',focus=(.5,.5)):
    cache_key=(key,round(w),round(h),mode,focus)
    if cache_key not in IMAGE_CACHE:
        im=Image.open(ROOT/'public'/DATA['assets'][key].lstrip('/')).convert('RGB')
        # 180 dpi preserves photographic detail without making the download heavy.
        target=(round(w*2.5),round(h*2.5))
        if mode=='cover': im=ImageOps.fit(im,target,Image.Resampling.LANCZOS,centering=focus)
        else:
            im.thumbnail(target,Image.Resampling.LANCZOS)
            bg=Image.new('RGB',target,'#eeeee8');bg.paste(im,((target[0]-im.width)//2,(target[1]-im.height)//2));im=bg
        out=BytesIO();im.save(out,format='JPEG',quality=88,optimize=True,progressive=True)
        IMAGE_CACHE[cache_key]=ImageReader(BytesIO(out.getvalue()))
    C.drawImage(IMAGE_CACHE[cache_key],x,H-y-h,w,h,mask='auto')
def caption(t,x,y,w): para(t,x,y,w,9.2,14,fill=MUTED)
pdfmetrics.registerFont(TTFont('Display',str(ROOT/'public/assets/Portfolio-Display-Bold.ttf')))

def display_width(t,size):
    shaped=shapeStr(t,'Display',size,force=True)
    return sum(g.x_advance for g in shaped.__shapeData__)*size/1000
def display(t,x,y,size=31,fill=INK,leading=None):
    leading=leading or size*1.65
    C.setFillColor(color(fill));C.setFont('Display',size)
    for i,line in enumerate(t.split('\n')):
        shaped=shapeStr(line,'Display',size,force=True)
        width=sum(g.x_advance for g in shaped.__shapeData__)*size/1000
        assert width<=CW+1,(PAGE,line,width)
        C.drawString(x-width,H-y-i*leading-size*.95,shaped)
    return y+len(t.split('\n'))*leading
def label(t,x,y,fill=MUTED): ar(t,x,y,11,'Medium',fill)
def begin(kicker,bookmark=None,title='',dark=False):
    global PAGE
    PAGE+=1;rect(0,0,W,H,INK if dark else PAPER)
    logo(M,28,24,'#ffffff' if dark else INK)
    en(kicker,W-M-155,39,8,'Helvetica','#b9c0c2' if dark else MUTED)
    if bookmark:C.bookmarkPage(bookmark);C.addOutlineEntry(title,bookmark,0)
def end(dark=False):
    rule(M,798,CW,'#51595c' if dark else LINE)
    en('LA CONSTRUCTION',M,814,7.5,'Helvetica-Bold','#dce0df' if dark else MUTED)
    en(f'{PAGE:02}',W-M-20,807,16,'Helvetica','#ffffff' if dark else INK)
    C.linkURL('https://www.la-construction.online',(M,18,M+180,40),relative=0,thickness=0)
    C.showPage()
def body(t,x,y,w,size=13,fill=MUTED):return para(t,x,y,w,size,size*1.55,fill)
def worklink(slug,y=764,dark=False):
    fill='#e2e5e3' if dark else INK
    ar('المشروع على الموقع',W-M,y,10,'Medium',fill)
    en('VIEW PROJECT',M,y+2,8,fill=fill)
    C.linkURL(f'https://www.la-construction.online/projects/{slug}?lang=ar',(M,H-y-20,W-M,H-y+4),relative=0,thickness=0)
def section_tag(number,name,y=100,dark=False):
    en(number,M,y,35,'Helvetica','#6f7b80' if dark else '#b4bab9')
    label(name,W-M,y+14,'#c8cecf' if dark else MUTED)
def brief(label_text,t,x,y,w):
    label(label_text,x+w,y,INK)
    return body(t,x,y+28,w,12.5)

# 01 | Cover: typography leads; the actual building anchors the lower half.
PAGE=1;rect(0,0,W,H,PAPER)
logo(M,33,40)
en('COMPANY PROFILE',W-M-122,55,9,'Helvetica',MUTED)
display('من التخطيط\nإلى التسليم',W-M,127,42)
ar('مقاولات وتشطيبات وحلول هندسية متكاملة',W-M,291,15,'Medium')
rule(M,337,CW)
en('LA CONSTRUCTION  /  SELECTED WORKS',M,357,9,'Helvetica-Bold',INK)
ar('ملف الشركة وسابقة الأعمال',W-M,353,12)
photo('al-amir-121',0,402,W,440,focus=(.48,.43))
C.bookmarkPage('cover');C.addOutlineEntry('LA Construction','cover',0)
C.linkURL('https://www.la-construction.online',(M,H-390,W-M,H-325),relative=0,thickness=0)
C.showPage()

# 02 | Positioning and an explicit client value proposition.
begin('01 / THE COMPANY','company','عن الشركة')
display('شركة واحدة\nومراحل مترابطة',W-M,105,30)
body('تجمع LA Construction أعمال الإنشاء والتشطيب والتصميم والتجهيزات الهندسية في منظومة تنفيذ واحدة؛ ليتحرك المشروع من الدراسة إلى التسليم بنطاق واضح ومسؤوليات محددة.',M,235,CW,14,INK)
photo('al-amir-35',M,351,230,251,focus=(.35,.5))
label('كيف نعمل مع العميل',W-M,354)
body('نبدأ بالرسومات والموقع، ثم نربط خطة التنفيذ بالموارد والميزانية والبرنامج الزمني. وخلال العمل، نوثّق التقدّم ونراجع التغييرات مع العميل قبل تنفيذها.',M+257,387,CW-257,13)
label('ما الذي يجمع خدماتنا',W-M,514)
body('تنسيق إنشائي ومعماري وهندسي، تحت متابعة واحدة وتواصل مباشر طوال مراحل المشروع.',M+257,547,CW-257,13)
rule(M,639,CW)
pillars=[('نطاق واضح','اتفاق على الأعمال والمواصفات'),('متابعة هندسية','مراجعة مراحل التنفيذ'),('تواصل مباشر','موقف واضح وتغييرات موثّقة')]
for i,(title,copy) in enumerate(pillars):
    x=M+(2-i)*(CW/3)
    ar(title,x+CW/3-10,667,16,'Medium')
    body(copy,x,703,CW/3-10,11.5)
end()

# 03 | Services: scope rather than generic marketing claims.
begin('02 / OUR EXPERTISE','services','الخدمات ونطاق الأعمال')
display('تكامل يبدأ\nمن نطاق العمل',W-M,102,29)
services=[
 ('المقاولات والأعمال الإنشائية','STRUCTURE','الهياكل الخرسانية وأعمال المباني، وفق الرسومات والمواصفات المعتمدة.'),
 ('التشطيبات الداخلية والخارجية','FINISHING','تجهيز وتشطيب الوحدات والمباني، وتنسيق الخامات والتفاصيل المعمارية.'),
 ('الديكور والتصميم الداخلي','INTERIOR DESIGN','ربط الفراغ والاستخدام والميزانية بتصميم يمكن تنفيذه وتنسيق تفاصيله.'),
 ('الميكانيكا والكهرباء والسباكة','MEP','تنفيذ التمديدات والتأسيس وتنسيق المسارات مع الإنشاء والعمارة.'),
 ('إدارة المشاريع والإشراف الهندسي','MANAGEMENT','التخطيط ومتابعة الوقت والتكلفة والجودة، وتوثيق التقدّم والتغييرات.')]
for i,(title,eng,copy) in enumerate(services):
    y=242+i*104
    en(f'0{i+1}',M,y+4,29,'Helvetica','#9aa3a5')
    ar(title,W-M,y,18,'Medium')
    en(eng,M+59,y+31,8,'Helvetica-Bold')
    body(copy,M+59,y+52,CW-59,12.2)
    if i<4:rule(M,y+93,CW)
end()

# 04 | Delivery process, now paired with specific information the client receives.
begin('03 / HOW WE DELIVER','method','منهجية التنفيذ')
display('كل مرحلة لها\nقرار ومراجعة',W-M,100,29)
steps=[
 ('الاستلام والدراسة','مراجعة الرسومات وجداول الكميات وزيارة الموقع لفهم متطلبات التنفيذ.'),
 ('التخطيط','تحديد البرنامج الزمني والموارد والميزانية ونقاط التنسيق بين الأعمال.'),
 ('التعاقد والتجهيز','تثبيت نطاق الأعمال وتجهيز الموقع واعتماد الخامات والموردين.'),
 ('التنفيذ','تنفيذ مرحلي تحت إشراف هندسي، مع مراجعة الجودة قبل الانتقال لما يلي.'),
 ('المتابعة','تقارير تقدّم وصور للموقع، وإدارة مكتوبة للتغييرات المؤثرة في النطاق.'),
 ('التسليم','معاينة نهائية ومعالجة الملاحظات وتسليم المستندات وفق التعاقد.')]
for i,(title,copy) in enumerate(steps):
    y=245+i*65
    en(f'0{i+1}',W-M-24,y,11,'Helvetica-Bold',INK)
    ar(title,W-M-48,y-2,16,'Medium')
    body(copy,M,y-2,287,11.7)
    if i<5:rule(M,y+48,CW)
rect(0,667,W,112,INK)
ar('وضوح قبل التنفيذ ومتابعة أثناء العمل',W-M,687,18,'Medium','#ffffff')
body('نطاق ومواصفات واضحة، واعتماد للخامات، وموقف دوري للتقدّم، ومراجعة للتغييرات قبل تنفيذها.',M,727,CW,12,'#d5dbdc')
end()

# 05 | Portfolio index, with interactive project navigation.
begin('04 / SELECTED WORK','portfolio','سابقة الأعمال',True)
display('من أرض الواقع\nإلى تفاصيل التنفيذ',W-M,113,30,'#ffffff')
body('أعمال إنشائية وتشطيبات داخلية وتجهيزات تخصصية، تعرض مراحل التنفيذ وطبيعة الأعمال المنفّذة بالمواقع.',M,255,CW,13.5,'#cbd2d4')
entries=[('الأمير','الإنشاء والمباني والهياكل المعدنية','al-amir',6),('بيورتي','الأعمال الخرسانية وتسلسل التنفيذ','purity',8),('شقة AP','المحارة وتجهيز الأسطح والتأسيس','ap-apartment',10),('مبنى M السكني','الهيكل الخرساني والمباني والواجهات','m-residential-building',11),('أعمال MEP','التمديدات الداخلية والشبكات الخارجية','mep-site-works',12)]
for i,(title,copy,slug,num) in enumerate(entries):
    y=357+i*72
    en(f'{num:02}',M,y+1,28,'Helvetica','#a7b4b9')
    ar(title,W-M,y,20,'Medium','#ffffff')
    ar(copy,W-M,y+34,11.5,'Regular','#bdc7ca')
    rule(M,y+60,CW,'#454e52')
    C.linkRect('',slug,(M,H-y-61,W-M,H-y+8),relative=0,thickness=0)
body('الصور توثّق حالة الأعمال وقت التصوير، وتُظهر أجزاء المواقع في مراحل تنفيذ مختلفة.',M,746,CW,10,'#aeb9bc')
end(True)

# 06 | Al-Amir: a proper project brief instead of a photo-only caption page.
begin('PROJECT 01 / AL-AMIR','al-amir','مشروع الأمير')
section_tag('01','أعمال إنشائية')
display('مشروع الأمير',W-M,148,32)
photo('al-amir-32',0,224,W,333,focus=(.5,.45))
caption('الهيكل الخرساني وأعمال المباني في إحدى مراحل التنفيذ',M,569,CW)
brief('نطاق الأعمال المعروض','حفر وأساسات وعناصر خرسانية ومبانٍ، إلى جانب مساحات ذات هياكل وأسقف معدنية.',M+198,610,CW-198)
brief('محور التنسيق','ترابط الهيكل والمباني وتجهيز المساحات داخل الموقع.',M,610,172)
worklink('al-amir');end()

# 07 | An image-led execution story, with a deliberately different rhythm.
begin('PROJECT 01 / CONSTRUCTION SEQUENCE')
display('من الأرض إلى\nالهيكل والمساحات',W-M,104,28)
photo('al-amir-1',M,238,164,287,focus=(.5,.42))
photo('al-amir-19',M+181,238,CW-181,209)
label('أساسات وتسليح',W-M,465)
body('تبدأ المراحل الظاهرة بالحفر وتجهيز الأساسات، ثم تجهيز وتسليح العناصر الخرسانية قبل الصب.',M+181,491,CW-181,12)
photo('al-amir-65',M,579,275,151)
label('مساحات وهياكل',W-M,583)
body('تتواصل الأعمال مع المباني والهيكل المعدني وتجهيز المساحات المسقوفة.',M+297,616,CW-297,12)
worklink('al-amir');end()

# 08 | Purity: panoramic photography with a technical scope summary.
begin('PROJECT 02 / PURITY','purity','مشروع بيورتي')
section_tag('02','أعمال خرسانية')
display('مشروع بيورتي',W-M,149,32)
photo('purity-14',0,224,W,240)
caption('تجهيز وتسليح ونجارة العناصر الإنشائية بالموقع',M,477,CW)
display('تسلسل يبدأ من الأساسات',W-M,523,22)
body('يشمل نطاق الأعمال المعروض تجهيز الأساسات وحدادة ونجارة العناصر الخرسانية وأعمال الصب. وتكشف اللقطات العلوية والأرضية انتقال العمل بين عناصر المشروع ومراحل الهيكل.',M,575,CW,13.5)
rule(M,672,CW)
label('عناصر التنفيذ',W-M,694)
ar('الأساسات  /  الأعمدة  /  الأسقف',W-M,724,17,'Medium')
worklink('purity');end()

# 09 | Purity continuation: context, detail, and a concise execution observation.
begin('PROJECT 02 / CONCRETE DETAILS')
display('الهيكل يتقدّم\nمرحلة بعد مرحلة',W-M,105,28)
photo('purity-15',M,238,CW,201)
caption('العناصر الخرسانية وتجهيزات الهيكل في إحدى مراحل التنفيذ',M,451,CW)
photo('purity-13',M,507,267,211)
label('متابعة العناصر والمراحل',W-M,510)
body('تتنوّع الأعمال الظاهرة بين تجهيز العناصر الخرسانية وتنفيذ الأعمدة والأسقف. ويُقرأ تقدّم المشروع من تتابع العناصر وربط مراحل التنفيذ ببعضها.',M+292,546,CW-292,12.5)
worklink('purity');end()

# 10 | Apartment: first fix and plastering, with no finished-interior claim.
begin('PROJECT 03 / AP APARTMENT','ap-apartment','شقة AP')
section_tag('03','شقة AP | تشطيبات داخلية')
display('تهيئة الأسطح\nأساس التشطيب',W-M,149,28)
photo('ap-4',M,287,281,332,focus=(.45,.45))
photo('ap-11',M+298,287,CW-298,169)
label('المحارة والتأسيس',W-M,483)
body('تجهيز الحوائط وتنفيذ المحارة داخل الفراغات، مع ظهور مسارات تأسيس في بعض المناطق.',M+298,516,CW-298,12)
rule(M,650,CW)
body('تسبق هذه المرحلة الدهانات والتشطيبات النهائية. ويتركّز التنسيق هنا على الأسطح والزوايا ونقاط التقاء المحارة بمسارات التأسيس.',M,676,CW,13)
worklink('ap-apartment');end()

# 11 | M: one large elevation, avoiding repetitive near-identical thumbnails.
begin('PROJECT 04 / M BUILDING','m-residential-building','مبنى M السكني')
section_tag('04','أعمال إنشائية ومبانٍ')
display('مبنى سكني\nفي مرحلة التكوين',W-M,147,27)
photo('m-3',0,275,W,327,focus=(.48,.45))
caption('الهيكل الخرساني والمباني والشرفات قبل التشطيبات الخارجية',M,614,CW)
body('مبنى سكني متعدد الطوابق تتكامل فيه العناصر الخرسانية مع أعمال المباني بالطوب. وتوضح الواجهات توزيع الفتحات والشرفات وحالة الأعمال في مرحلة ما قبل التشطيب الخارجي.',M,654,CW,13.5)
worklink('m-residential-building');end()

# 12 | MEP internal: services coordinated with the spatial envelope.
begin('SPECIALIST WORK / INTERNAL MEP','mep-site-works','أعمال الميكانيكا والكهرباء')
section_tag('05','أعمال MEP | التأسيس الداخلي')
display('شبكات تُنسّق\nقبل إغلاق الأسطح',W-M,147,27)
photo('mep-3',M,278,CW,253)
caption('توزيع مسارات التمديدات الكهربائية داخل الفراغات',M,542,CW)
photo('mep-2',M,585,184,143)
label('كهرباء وسباكة وتنسيق مسارات',W-M,585)
body('تمديدات كهربائية داخلية وتأسيس سباكة، مع تنسيق الشبكات مع العناصر المعمارية والإنشائية قبل إغلاق الأسطح واستكمال التشطيب.',M+209,619,CW-209,12.5)
worklink('mep-site-works');end()

# 13 | MEP external: the infrastructure beneath the visible building.
begin('SPECIALIST WORK / SITE NETWORKS')
display('ما تحت الأرض\nجزء من كفاءة المبنى',W-M,107,27)
photo('mep-18',M,245,204,225)
label('شبكات خارجية وغرف تفتيش',W-M,246)
body('مد المواسير وشبكات الصرف الخارجية، وتنفيذ غرف التفتيش وربطها بالمسارات. وتجمع هذه الصفحة نماذج لأعمال تخصصية موثّقة بالمواقع.',M+229,284,CW-229,12.5)
label('محور التنسيق',W-M,400)
body('المسارات ونقاط الربط وإتاحة الوصول إلى الشبكات عبر غرف التفتيش.',M+229,430,CW-229,12)
photo('mep-16',M,518,CW,210)
worklink('mep-site-works');end()

# 14 | Formal, direct close with decision-makers and a working website QR.
begin('05 / START A CONVERSATION','contact','التواصل مع الشركة')
display('ابدأ بنطاق واضح',W-M,113,32)
body('موقع المشروع ومساحته وطبيعة الاستخدام والأعمال المطلوبة هي نقطة البداية لمناقشة خطوات التنفيذ وإعداد عرض السعر.',M,194,CW,14)
label('تواصل مباشرة مع الشركاء الإداريين',W-M,288)
for i,p in enumerate(DATA['partners']):
    x=M+(1-i)*(CW+24)/2;w=(CW-24)/2
    rule(x,332,w)
    ar(p['nameAr'],x+w,358,19,'Medium')
    body('شريك إداري\n'+('هندسة مدنية' if i==0 else 'هندسة ميكانيكية'),x,399,w,12)
    en(p['phone'],x,465,20,'Helvetica',INK)
    C.linkURL('tel:'+p['phone'],(x,H-499,x+w,H-452),relative=0,thickness=0)
rect(0,552,W,H-552,INK)
logo(M,582,34,'#ffffff')
ar('شريكك في بناء مستقبل أفضل',W-M,706,20,'Medium','#ffffff')
en('www.la-construction.online',M,665,15,'Helvetica','#ffffff')
qr=qrcode.QRCode(box_size=8,border=2,error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data('https://www.la-construction.online');qr.make(fit=True)
im=qr.make_image(fill_color=INK,back_color='white').convert('RGB')
C.drawImage(ImageReader(im),W-M-108,H-576-108,108,108)
C.linkURL('https://www.la-construction.online',(M,H-766,W-M,H-552),relative=0,thickness=0)
ar('استكشف المشاريع وتواصل مع فريقنا',W-M,750,11,'Regular','#cad2d5')
end(True)

C.save()
assert PAGE==14
assert all(y<790 for page,y in CONTENT_BOUNDS),CONTENT_BOUNDS
print(json.dumps({'file':str(OUT),'pages':PAGE,'bytes':OUT.stat().st_size,'image_frames':len(IMAGE_CACHE)}))
