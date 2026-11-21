"""Regression: shared CTA styles must not make the mobile header CTA visible.

Evaluate the actual public stylesheet cascade, including :is() specificity.
Requires tinycss2, cssselect2 and lxml.
"""
from pathlib import Path
import re
import tinycss2
import cssselect2
from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
SHEETS = re.findall(r"import './([^']+\.css)'", (ROOT/'app/layout.tsx').read_text())

def media_matches(query, width):
    for branch in query.split(','):
        if 'print' in branch or 'prefers-reduced-motion:reduce' in branch.replace(' ', ''):
            continue
        bounds = re.findall(r'(min|max)-width\s*:\s*(\d+)px', branch)
        if all(width >= int(value) if kind == 'min' else width <= int(value) for kind, value in bounds):
            return True
    return False

def cascade(width, lang, scrolled, menu_open):
    html = f'''<div class="la-site" lang="{lang}" dir="{'rtl' if lang == 'ar' else 'ltr'}">
      <header class="la-header {'is-scrolled' if scrolled else ''}">
       <a class="la-brand"><img/><span>LA CONSTRUCTION</span></a>
       <nav class="la-nav {'is-open' if menu_open else ''}"><a>Home</a></nav>
       <div class="la-header-actions"><a class="la-language">EN</a><a class="la-contact-link">Start a project</a><button class="la-menu"/></div>
      </header>
      <main><section class="la-hero"><a class="la-button">Projects</a></section></main>
    </div>'''
    tree = cssselect2.ElementWrapper.from_html_root(etree.fromstring(html))
    matcher = cssselect2.Matcher()
    def add(rules):
        for rule in rules:
            if rule.type == 'at-rule' and rule.content is not None:
                if rule.lower_at_keyword == 'media' and media_matches(tinycss2.serialize(rule.prelude), width):
                    add(tinycss2.parse_rule_list(rule.content, skip_whitespace=True, skip_comments=True))
            elif rule.type == 'qualified-rule':
                declarations = [(d.lower_name, tinycss2.serialize(d.value).strip(), d.important) for d in tinycss2.parse_declaration_list(rule.content) if d.type == 'declaration' and d.lower_name in ['display','height','min-height','background','color']]
                if not declarations:
                    continue
                try:
                    for selector in cssselect2.compile_selector_list(tinycss2.serialize(rule.prelude)):
                        matcher.add_selector(selector, declarations)
                except cssselect2.SelectorError:
                    pass
    for name in SHEETS:
        add(tinycss2.parse_stylesheet((ROOT/'app'/name).read_text(), skip_whitespace=True, skip_comments=True))
    result = {}
    for element in tree.iter_subtree():
        values, priorities = {}, {}
        for specificity, order, pseudo, declarations in matcher.match(element):
            if pseudo is not None:
                continue
            for name, value, important in declarations:
                priority = (important, specificity, order)
                if name not in priorities or priority >= priorities[name]:
                    values[name], priorities[name] = value, priority
        for cls in element.classes:
            result[cls] = values
    return result

for lang in ['ar','en']:
    for width in [320,360,390,430,760,980,1024,1100,1280,1440]:
        for scrolled in [False,True]:
            for menu_open in [False,True]:
                styles = cascade(width,lang,scrolled,menu_open)
                assert styles['la-contact-link']['display'] == ('none' if width <= 1100 else 'inline-flex'), (width,lang,styles['la-contact-link'])
                assert styles['la-menu']['display'] == ('flex' if width <= 980 else 'none'), (width,lang)
                if width <= 980:
                    assert styles['la-header']['height'] == '72px'
                    assert styles['la-nav']['display'] == ('flex' if menu_open else 'none')
                assert styles['la-button']['display'] == 'inline-flex'
print('PASS: CTA hidden through tablet widths, menu reachable on phones, compact header, open/closed and scrolled states; both languages at 10 widths.')
