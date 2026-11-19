"""Dependency-free checks for the generated pages: links, ids, headings, images, and facts that must stay."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
PAGES = ('index', 'programs', 'muharram', 'sunday-school', 'community', 'about', 'visit', 'donate')
MUST = {  # facts that must stay on the site (PRODUCT.md)
    'index': ['3031 Preston Avenue NW', 'jafferycenter@gmail.com', 'Small classes', 'New River Valley', 'Qur’an 3:103'],
    'sunday-school': ['grasshoppersignup.com/s/rrjq9a', '6 to 18', 'volunteer teachers', 'pronunciation'],
    'community': ['mobile number', 'city and state', 'Qur’an 5:2', 'cooperate in righteousness'],
    'about': ['Qur’an 3:103'],
    'muharram': ['June 16', 'June 28, 2026', 'Hamza Saudagar', 'This program has ended', 'Maghrib'],
    'donate': ['G4QYMJA5YGT8G', 'venmo.com', '81-1064023', 'Qur’an 2:245'],
    'visit': ['3031 Preston Avenue NW', 'Roanoke, VA 24012'],
}
BANNED = ['DM Sans', 'Cormorant', 'upcoming Muharram', 'Zelle:', 'testimonial']


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.hrefs, self.srcs, self.h1, self.imgs_no_alt, self.text = set(), [], [], 0, 0, []

    def handle_starttag(self, tag, a):
        a = dict(a)
        if a.get('id'): self.ids.add(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'a' and a.get('href'): self.hrefs.append(a['href'])
        if tag in ('img', 'script') and a.get('src'): self.srcs.append(a['src'])
        if tag == 'link' and a.get('href') and a.get('rel') in ('stylesheet', 'icon'): self.srcs.append(a['href'])
        if tag == 'img' and 'alt' not in a: self.imgs_no_alt += 1

    def handle_data(self, d): self.text.append(d)


errors = []
for name in PAGES:
    f = ROOT / f'{name}.html'
    if not f.exists():
        errors.append(f'{name}: missing'); continue
    raw = f.read_text(encoding='utf-8'); p = P(); p.feed(raw)
    text = ' '.join(p.text)
    if p.h1 != 1: errors.append(f'{name}: {p.h1} h1 tags')
    if p.imgs_no_alt: errors.append(f'{name}: img without alt')
    if '<title>' not in raw or 'name="description"' not in raw: errors.append(f'{name}: title or description missing')
    for ref in p.hrefs + p.srcs:
        if re.match(r'(https?:|mailto:|#)', ref): continue
        target = ref.split('#')[0].split('?')[0]
        if target and not (ROOT / target).exists(): errors.append(f'{name}: broken local ref {ref}')
        if '#' in ref and not target and ref[1:] not in p.ids: errors.append(f'{name}: missing id {ref}')
    for must in MUST.get(name, []):
        if must not in raw and must not in text: errors.append(f'{name}: missing fact "{must}"')
    for bad in BANNED:
        if bad in raw: errors.append(f'{name}: banned string "{bad}"')
for rel in ('art.js', 'scripts/dotdither.js', 'public/og.jpg'):
    if not (ROOT / rel).exists(): errors.append(f'missing asset {rel}')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'ok: {len(PAGES)} pages checked')
