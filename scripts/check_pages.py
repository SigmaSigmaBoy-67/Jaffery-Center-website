"""Dependency-free checks for generated multi-page HTML and its local links."""
from html.parser import HTMLParser
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
PAGES = ('index', 'about', 'programs', 'sunday-school', 'visit', 'donate')
INTRO_SOURCE = (ROOT / 'src/glyph-intro-entry.tsx').read_text(encoding='utf-8')
PORTAL_SOURCE = (ROOT / 'components/ui/glyph-portal.tsx').read_text(encoding='utf-8')


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.active = []
        self.images = []
        self.favicons = []
        self.navs = []
        self.filters = set()
        self.categories = set()
        self.footer_config = None
        self.section = None
        self.brand_slots = {'header': 0, 'footer': 0}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('header', 'footer'):
            self.section = tag
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if attrs.get('id') == 'footer-root':
            self.footer_config = json.loads(attrs['data-config'])
        if tag == 'a':
            href = attrs.get('href', '')
            self.links.append(href)
            if attrs.get('aria-current') == 'page':
                self.active.append(href)
        if tag == 'img':
            self.images.append(attrs.get('src', ''))
            if attrs.get('src') == 'assets/brand/mihrab-color.svg' and self.section in self.brand_slots:
                self.brand_slots[self.section] += 1
        if tag == 'link' and attrs.get('rel') == 'icon':
            self.favicons.append(attrs.get('href', ''))
        if tag == 'nav':
            self.navs.append(attrs.get('aria-label'))
        if 'data-filter' in attrs:
            self.filters.add(attrs['data-filter'])
        if 'data-category' in attrs:
            self.categories.add(attrs['data-category'])

    def handle_endtag(self, tag):
        if tag == self.section:
            self.section = None


for name in PAGES:
    path = ROOT / f'{name}.html'
    text = path.read_text(encoding='utf-8')
    page = Page()
    page.feed(text)
    assert 'main' in page.ids and 'liquid-nav-root' in page.ids and 'footer-root' in page.ids, name
    assert 'hero-hills-root' in page.ids and '/src/hills-entry.tsx' in text, name
    assert 'site.js' in text, name
    if name == 'index':
        assert 'glyph-intro-root' in page.ids and '/src/glyph-intro-entry.tsx' in text
        assert 'jaffery-glyph-intro-v1' in text and 'prefers-reduced-motion: reduce' in text
        assert 'data-gp-skip' in text and '#FAF8F2' in text
        assert 'sessionStorage.setItem(k,"done")' in text and '"started"' not in text
        assert 'import.meta.env.DEV' in INTRO_SOURCE and 'introDebug' in INTRO_SOURCE
        assert 'className: "glyph-portal-intro"' in INTRO_SOURCE
        assert 'showForegroundGlyph: true' in INTRO_SOURCE and 'front: <h1' not in INTRO_SOURCE
        assert 'glyph-intro-react-root' in text
        assert 'data-gp-foreground-glyph' in PORTAL_SOURCE
        assert 'foregroundGlyph.setAttribute("transform", transform)' in PORTAL_SOURCE
        assert 'maskCamera.setAttribute("transform", transform)' in PORTAL_SOURCE
        assert 'data-gp-cover' in PORTAL_SOURCE and 'data-gp-exit-aperture' not in PORTAL_SOURCE
        assert 'Math.max(W, H) / (target.radius * 2) * 1.15' in PORTAL_SOURCE
        assert '[0, 25, 50, 75, 90, 100]' in INTRO_SOURCE
    else:
        assert 'glyph-intro-root' not in page.ids and 'glyph-intro-entry.tsx' not in text, name
    assert '/src/footer-entry.tsx' in text and page.footer_config, name
    assert len(page.footer_config['explore']) == 6 and len(page.footer_config['find']) == 3, name
    for item in [page.footer_config['cta'], *page.footer_config['explore'], *page.footer_config['find']]:
        assert item['href'] and item['href'] != '#', (name, item)
        if item['href'].endswith('.html'):
            assert (ROOT / item['href']).is_file(), (name, item)
    assert page.navs.count('Main navigation') == 1 and page.navs.count('Mobile navigation') == 1, name
    assert page.active == [f'{name}.html', f'{name}.html'], (name, page.active)
    assert 'New River' not in text, name
    assert 'paypal.com' not in text.lower() and 'hosted_button_id' not in text.lower(), name
    for href in page.links:
        if href.startswith('#'):
            assert href[1:] in page.ids, (name, href)
        elif href.endswith('.html'):
            assert (ROOT / href).is_file(), (name, href)
    assert page.favicons == ['assets/brand/mihrab-color.svg'], name
    assert page.images.count('assets/brand/mihrab-color.svg') == 2, name
    assert page.brand_slots == {'header': 1, 'footer': 1}, name  # one mark per original branding slot
    for image in (*page.images, *page.favicons):
        assert (ROOT / image).is_file(), (name, image)
    if name == 'programs':
        assert page.filters == {'all', 'faith', 'learning', 'community'}
        assert page.categories == page.filters - {'all'}
    if name == 'visit':
        assert {'contact-form', 'form-status', 'copy-status'} <= page.ids
    print(f'{name}.html: OK')
