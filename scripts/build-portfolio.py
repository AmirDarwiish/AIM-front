"""Build the Arabic institutional portfolio from supplied company photographs.

Dependencies: reportlab, Pillow, arabic-reshaper, python-bidi,
qrcode. Run from the repository root; output is public/documents/LA-Construction-Portfolio.pdf.
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
from reportlab.pdfbase.ttfonts import TTFont
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
INK, MUTED, PAPER, LINE = '#242424', '#676763', '#f7f7f3', '#deded6'
C = canvas.Canvas(str(OUT), pagesize=(W,H), pageCompression=1)
C.setTitle('LA Construction | Company Portfolio')
C.setAuthor('LA Construction')
C.setSubject('Company profile, construction services and selected project photographs')
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
def para(t,x,y,w,size=12,leading=None,fill=MUTED,font='Regular'):
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
def start(label,title=None,subtitle=None,dark=False,bookmark=None):
    global PAGE
    PAGE+=1
    rect(0,0,W,H,INK if dark else PAPER)
    if bookmark:
        C.bookmarkPage(bookmark);C.addOutlineEntry(title or label,bookmark,0)
    logo(M,25,28,'#fff' if dark else INK)
    en(label.upper(),W-M-140,38,8,'Helvetica','#d2d2cb' if dark else MUTED)
    rule(M,73,CW,'#50504c' if dark else LINE)
    if title: ar(title,W-M,99,28,'Medium','#fff' if dark else INK)
    if subtitle: ar(subtitle,W-M,140,11,'Regular','#d2d2cb' if dark else MUTED)
def finish(dark=False):
    rule(M,797,CW,'#50504c' if dark else LINE)
    en('LA CONSTRUCTION  /  COMPANY PORTFOLIO',M,811,7.2,fill='#d2d2cb' if dark else MUTED)
    en(f'{PAGE:02d}',W-M-12,809,9,'Helvetica-Bold','#fff' if dark else INK)
    C.linkURL('https://www.la-construction.online',(M,20,M+240,43),relative=0,thickness=0)
    C.showPage()
def project_link(slug,y=765):
    ar('استكشف صور المشروع على الموقع',W-M,y,10,'Medium')
    C.linkURL(f'https://www.la-construction.online/projects/{slug}?lang=ar',(W-M-210,H-y-20,W-M,H-y+3),relative=0,thickness=0)
def duo(a,b,y,h,ca,cb):
    gap=14;w=(CW-gap)/2
    photo(a,M,y,w,h);photo(b,M+w+gap,y,w,h)
    caption(ca,M,y+h+9,w);caption(cb,M+w+gap,y+h+9,w)

# 01 / Cover
PAGE=1
rect(0,0,W,H,INK)
photo('al-amir-121',0,0,W,510,focus=(.52,.42))
rect(M,30,224,61,'#ffffff')
logo(M+16,39,36)
en('COMPANY PROFILE / SELECTED WORKS',M,552,9,'Helvetica','#d4d4cd')
ar('بورتفوليو الشركة',W-M,590,22,'Medium','#fff')
ar('من التخطيط',W-M,636,39,'Medium','#fff')
ar('إلى التسليم.',W-M,690,39,'Medium','#fff')
en('CONSTRUCTION  /  FINISHING  /  ENGINEERING',M,775,8.8,'Helvetica','#d4d4cd')
C.bookmarkPage('cover');C.addOutlineEntry('LA Construction', 'cover',0)
C.linkURL('https://www.la-construction.online',(M,30,W-M,100),relative=0,thickness=0)
C.showPage()

# 02 / Company
start('01 / Company','شريكك في بناء مستقبل أفضل.','المقاولات والتشطيبات والحلول الهندسية',bookmark='company')
para('LA Construction شركة مقاولات وتشطيبات تقدّم خدمات متكاملة تشمل الأعمال الإنشائية، والتشطيبات الداخلية والخارجية، والديكور والتصميم الداخلي، وإدارة المشاريع والإشراف الهندسي.',M,181,CW,14,23,INK)
para('نجمع مراحل المشروع تحت إشراف واحد، مع وضوح نطاق الأعمال والتكلفة والجدول الزمني، وتواصل مباشر مع العميل من التخطيط إلى التسليم.',M,272,CW,12.5,21)
rule(M,350,CW)
ar('رؤيتنا',W-M,374,19,'Medium')
para('أن نكون الشريك الأول والأكثر ثقة في قطاع المقاولات والتشطيبات في مصر، بمشاريع تشهد جودتها لنا.',M,408,CW,12.5,21)
ar('رسالتنا',W-M,472,19,'Medium')
para('تنفيذ مشاريع عملائنا وفق المواصفات والميزانية والجدول الزمني المتفق عليه، من خلال فريق هندسي يتابع كل مرحلة ويجمع الإنشاء والتشطيب والتصميم في خدمة متكاملة.',M,507,CW,12.5,21)
photo('al-amir-90',M,601,CW,165)
finish()

# 03 / Services
start('02 / Expertise','خدمات مترابطة. مسؤولية واضحة.','نحدد نطاق كل خدمة بما يناسب احتياجات المشروع.',bookmark='services')
services=[
 ('المقاولات والأعمال الإنشائية','Construction & Structural Works','تنفيذ الهياكل الخرسانية والأعمال الإنشائية وفق الرسومات والمواصفات المعتمدة.'),
 ('التشطيبات الداخلية والخارجية','Interior & Exterior Finishing','تجهيز وتشطيب الوحدات والمباني، وتنسيق الأعمال المعمارية والخامات والتفاصيل حتى التسليم المتفق عليه.'),
 ('الديكور والتصميم الداخلي','Interior Design & Decor','تصميم وتنفيذ الفراغات بما يناسب الاستخدام والميزانية، وربط قرارات التصميم بمتطلبات التنفيذ.'),
 ('الميكانيكا والكهرباء والسباكة','Mechanical, Electrical & Plumbing','تنسيق وتنفيذ مسارات الكهرباء والسباكة والأعمال الميكانيكية ضمن نطاق المشروع.'),
 ('إدارة المشاريع والإشراف الهندسي','Project Management & Supervision','التخطيط والجدولة ومتابعة التنفيذ والتكاليف والجودة، مع توثيق التقدّم والتغييرات.')]
for i,(title,label,body) in enumerate(services):
    y=185+i*116
    en(f'0{i+1}',M,y+3,22,'Helvetica',INK)
    ar(title,W-M,y,18,'Medium')
    en(label,M+52,y+30,8.8)
    para(body,M+52,y+51,CW-52,11.5,18)
    if i<4:rule(M,y+103,CW)
finish()

# 04 / Method
start('03 / Delivery','من دراسة الموقع إلى التسليم.','منهجية عمل واضحة، ومتابعة هندسية في كل مرحلة.',bookmark='method')
steps=next(s for s in DATA['sections'] if s['sectionKey']=='la-process')['items']
gap=25;cell=(CW-gap)/2
for i,step in enumerate(steps):
    row=i//2;col=1-i%2;x=M+col*(cell+gap);y=190+row*135
    en(f'0{i+1}',x,y,12,'Helvetica-Bold',INK)
    ar(step['titleAr'],x+cell,y+27,17,'Medium')
    para(step['descriptionAr'],x,y+61,cell,11.5,18)
    rule(x,y+115,cell)
rect(M,620,CW,145,'#eaeae3')
ar('الجودة والسلامة وضبط التكلفة',W-M-20,644,18,'Medium')
para('اعتماد الخامات قبل التوريد، وفحص مراحل التنفيذ، وتأمين الموقع. نتابع المنفذ مقابل المخطط، ونرفع التغييرات للعميل قبل تنفيذها.',M+20,685,CW-40,12,20)
finish()

# 05 / Project directory
start('04 / Selected Work','من أعمالنا على أرض الواقع.','مشروعات وأعمال تخصصية موثّقة بصور من الموقع.',bookmark='portfolio')
directory=[('الأمير','أعمال إنشائية وهياكل ومباني','al-amir','al-amir-35',6),('بيورتي','أعمال خرسانية ومراحل تنفيذ','purity','purity-14',8),('شقة AP','المحارة وتجهيز الأسطح والتأسيس','ap-apartment','ap-11',10),('مبنى M السكني','الهيكل الخرساني والمباني والواجهات','m-residential-building','m-3',11),('أعمال MEP','الكهرباء والسباكة وشبكات الصرف','mep-site-works','mep-3',12)]
for i,(title,desc,slug,key,num) in enumerate(directory):
    y=185+i*109
    photo(key,M,y,115,84)
    ar(title,W-M,y+8,20,'Medium')
    para(desc,M+138,y+43,CW-138,11,17)
    en(f'{num:02d}',M+138,y+77,10,'Helvetica-Bold')
    C.linkRect('',slug,(M,H-y-93,W-M,H-y+4),relative=0,thickness=0)
    if i<4:rule(M,y+98,CW)
para('تعرض الصور مراحل التنفيذ وقت التصوير، وقد تظهر أجزاء المشروع في مراحل عمل مختلفة.',M,750,CW,10,16)
finish()

# 06 / Al-Amir
start('Project 01 / Al-Amir','مشروع الأمير','أعمال إنشائية | مراحل تنفيذ المباني والأعمال الخرسانية',bookmark='al-amir')
photo('al-amir-32',M,181,CW,302)
caption('الهيكل الخرساني والمباني في إحدى مراحل التنفيذ.',M,493,CW)
para('يشمل توثيق المشروع أعمال الحفر وتجهيز الأساسات، وحدادة ونجارة العناصر الخرسانية والصب، ثم تنفيذ المباني والمحارة في أجزاء من الموقع.',M,526,CW,12.2,20)
duo('al-amir-4','al-amir-19',599,128,'الحفر وتجهيز عناصر الأساسات.','تسليح العناصر الخرسانية قبل الصب.')
project_link('al-amir');finish()

# 07 / Al-Amir continuation
start('Project 01 / Site Details','الهياكل والمساحات المنفّذة.','مشروع الأمير | تفاصيل مكملة للأعمال بالموقع')
photo('al-amir-65',M,181,CW,285)
caption('مساحات داخلية بهياكل وأسقف معدنية وأعمال تجهيز الأرضيات.',M,477,CW)
para('تُظهر هذه المجموعة تفاصيل الهيكل المعدني والمباني المحيطة به، إلى جانب مراحل تجهيز المساحات الداخلية. ويعكس تنوّع اللقطات اختلاف مراحل العمل داخل الموقع.',M,510,CW,12.2,20)
duo('al-amir-55','al-amir-82',599,128,'الهيكل المعدني وأعمال المباني.','تجهيز الأرضيات داخل المساحات المسقوفة.')
project_link('al-amir');finish()

# 08 / Purity
start('Project 02 / Purity','مشروع بيورتي','أعمال خرسانية | الأساسات والعناصر الإنشائية',bookmark='purity')
photo('purity-14',M,181,CW,222)
caption('لقطة علوية توضح تسليح ونجارة العناصر الإنشائية بالموقع.',M,414,CW)
para('يوثّق المشروع مراحل تنفيذ الأعمال الخرسانية، من تجهيز الأساسات إلى حدادة ونجارة العناصر وأعمال الصب. وتوضح اللقطات الأرضية والعلوية تسلسل التنفيذ وتطوّر الأعمال.',M,450,CW,12.5,21)
duo('purity-11','purity-7',555,172,'تجهيز وتنفيذ العناصر الخرسانية بالموقع.','تفاصيل القواعد والعناصر الخرسانية.')
project_link('purity');finish()

# 09 / Purity continuation
start('Project 02 / Concrete Works','تقدّم الهيكل الخرساني.','مشروع بيورتي | الأعمدة والأسقف وتفاصيل التنفيذ')
photo('purity-3',M,181,CW,240)
caption('الأعمدة والعناصر الخرسانية أثناء التنفيذ.',M,431,CW)
para('تُظهر الصور أجزاء من الهيكل الخرساني في مراحل مختلفة، من أعمال التسليح والتجهيز إلى تنفيذ الأعمدة والأسقف، مع لقطات لتفاصيل الأعمال بالموقع.',M,466,CW,12.5,21)
photo('purity-15',M,563,CW,164)
caption('تجهيزات وعناصر الهيكل الخرساني في إحدى مراحل العمل.',M,737,CW)
project_link('purity');finish()

# 10 / Apartment
start('Project 03 / AP Apartment','شقة AP','تشطيبات داخلية | المحارة والتأسيس',bookmark='ap-apartment')
para('أعمال تجهيز الحوائط وتنفيذ المحارة داخل وحدة سكنية، مع ظهور مسارات التأسيس في بعض الفراغات، تمهيدًا للدهانات ومراحل التشطيب التالية.',M,183,CW,13,22)
photo('ap-4',M,276,CW,260)
caption('تنفيذ المحارة وتجهيز الأسطح الداخلية.',M,546,CW)
duo('ap-11','ap-1',585,142,'حالة أحد الفراغات أثناء التنفيذ.','تفاصيل تجهيز الحائط ومسارات التأسيس.')
project_link('ap-apartment');finish()

# 11 / M Building
start('Project 04 / M Building','مبنى M السكني','أعمال إنشائية | الهيكل الخرساني والمباني',bookmark='m-residential-building')
photo('m-3',M,181,CW,316)
caption('واجهة المبنى مع ظهور الهيكل الخرساني وأعمال المباني بالطوب.',M,507,CW)
para('مبنى سكني متعدد الطوابق توضح صوره زوايا مختلفة للواجهات والشرفات وأعمال المباني، في مرحلة تسبق التشطيبات الخارجية.',M,542,CW,12.5,21)
duo('m-1','m-4',617,110,'زاوية توضح الواجهات والشرفات.','أعمال المباني والأجزاء الخارجية وقت التصوير.')
project_link('m-residential-building');finish()

# 12 / MEP Interior
start('Specialist Work / MEP','الميكانيكا والكهرباء والسباكة.','مجموعة أعمال تخصصية | التأسيس الداخلي',bookmark='mep-site-works')
photo('mep-3',M,181,CW,289)
caption('مسارات التمديدات الكهربائية داخل الفراغات.',M,480,CW)
para('تشمل الأعمال الموثّقة تمديدات كهربائية داخلية وتأسيس سباكة، مع تنسيق مسارات الشبكات داخل الفراغات وقبل إغلاق الأسطح أو استكمال التشطيب.',M,516,CW,12.5,21)
duo('mep-2','mep-4',601,126,'تأسيس السباكة داخل أحد الفراغات.','تنسيق مسارات التمديدات أسفل السقف.')
project_link('mep-site-works');finish()

# 13 / MEP External
start('Specialist Work / Site Networks','الشبكات الخارجية وغرف التفتيش.','أعمال MEP | مراحل التأسيس والتنفيذ بالمواقع')
photo('mep-16',M,181,CW,289)
caption('أعمال مد الشبكات الخارجية في المسارات المجهزة.',M,480,CW)
para('تضم المجموعة أعمال مد المواسير وشبكات الصرف الخارجية، وتنفيذ غرف التفتيش وربطها بالشبكات. الصور المعروضة نماذج لأعمال تخصصية من المواقع.',M,516,CW,12.5,21)
duo('mep-8','mep-19',601,126,'تجهيز غرف التفتيش وربط المسارات.','تفاصيل غرف التفتيش والشبكات الخارجية.')
project_link('mep-site-works');finish()

# 14 / Contact
start('05 / Let\'s Build','خلّينا نناقش مشروعك.','نبدأ بفهم الموقع ونطاق الأعمال والمساحة ومتطلبات التنفيذ.',dark=True,bookmark='contact')
para('شاركنا تفاصيل مشروعك لنناقش نطاق العمل وخطوات التنفيذ المناسبة، ونحدد المتطلبات التي يُبنى عليها عرض السعر.',M,190,CW,15,25,'#e0e0da')
for i,partner in enumerate(DATA['partners']):
    y=300+i*135
    rule(M,y,CW,'#50504c')
    ar(partner['nameAr'],W-M,y+24,21,'Medium','#fff')
    ar('شريك إداري | '+('هندسة مدنية' if i==0 else 'هندسة ميكانيكية'),W-M,y+62,12,'Regular','#d2d2cb')
    en(partner['phone'],M,y+88,21,'Helvetica','#fff')
    C.linkURL('tel:'+partner['phone'],(M,H-y-115,M+180,H-y-82),relative=0,thickness=0)
qr=qrcode.QRCode(box_size=8,border=2,error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data('https://www.la-construction.online');qr.make(fit=True)
qrimg=qr.make_image(fill_color='#242424',back_color='white').convert('RGB')
C.drawImage(ImageReader(qrimg),M,H-612-122,122,122,mask='auto')
ar('تعرّف على مشاريعنا وتواصل معنا',W-M,632,18,'Medium','#fff')
en('www.la-construction.online',M+149,681,14,'Helvetica','#fff')
C.linkURL('https://www.la-construction.online',(M,H-746,W-M,H-612),relative=0,thickness=0)
ar('LA Construction | شريكك في بناء مستقبل أفضل.',W-M,756,11,'Regular','#d2d2cb')
finish(True)

C.save()
assert PAGE==14
assert all(y<790 for page,y in CONTENT_BOUNDS),CONTENT_BOUNDS
print(json.dumps({'file':str(OUT),'pages':PAGE,'bytes':OUT.stat().st_size,'photographic_frames':len(IMAGE_CACHE)}))
