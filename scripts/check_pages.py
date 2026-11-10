"""Dependency-free checks for generated multi-page HTML and its local links."""
from html.parser import HTMLParser
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
PAGES = ('index', 'about', 'community', 'programs', 'sunday-school', 'visit', 'donate')


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
            if attrs.get('src') in {'assets/brand/jaffery-center-monogram.png', 'assets/brand/jaffery-center-logo-light.png'} and self.section in self.brand_slots:
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
    assert 'hero-hills-root' not in page.ids and '/src/hills-entry.tsx' not in text, name
    assert 'site.js' in text, name
    if name == 'community':
        assert 'community-dashboard-root' in page.ids and '/src/community-entry.tsx' in text
        assert 'adjustable-glass-dashboard.css' in text
        dashboard = (ROOT / 'components/ui/adjustable-glass-dashboard.tsx').read_text(encoding='utf-8')
        assert all(item in dashboard for item in ('Programs & gatherings', 'Sunday School', '3031 Preston Avenue', 'jafferycenter@gmail.com'))
        assert all(item not in dashboard for item in ('transactions', 'balance', 'savings goals', 'Automate Flows', 'Troy'))
        assert 'assets/house-of-light.svg' in dashboard and 'gsap' in dashboard and 'useGSAP' in dashboard
    if name == 'visit':
        assert 'method=\"post\"' in text and 'mailto:jafferycenter@gmail.com' in text
    if name == 'index':
        assert 'glyph-intro-root' not in page.ids and '/src/glyph-intro-entry.tsx' not in text
        assert 'data-glyph-intro' not in text and 'data-gp-skip' not in text
        assert 'threshold-run' in page.ids and 'threshold-stage' in page.ids and 'house-scene' in page.ids
        assert '/src/house-scene-entry.ts' in text and 'assets/house-of-light.svg' in (ROOT / 'build.py').read_text()
        scene = (ROOT / 'assets/house-of-light.svg').read_text(encoding='utf-8')
        assert all(layer in scene for layer in ('scene-camera', 'mountain-distant', 'mountain-middle', 'mountain-near', 'geometric-screen', 'screen-shadow'))
        assert all(label in text for label in ('Dawn', 'Day', 'Dusk', 'Explore the center', 'Plan a visit'))
        assert all(chapter in text for chapter in ('Gather in faith', 'Learn together', 'Find your community'))
        assert 'data-notebook-turn' in text and 'notebook-notes' in text
        assert 'Illustrative scene · not a photograph of the center' in text
        assert 'Blue Ridge' in text and '3031 Preston Avenue' in text
        assert 'home-scroll-experience-root' not in page.ids and '/src/home-experience-entry.tsx' not in text
        assert 'courtyard-art' not in text and 'parallax' not in text.lower()
    else:
        assert 'glyph-intro-root' not in page.ids and 'glyph-intro-entry.tsx' not in text, name
    assert '/src/footer-entry.tsx' not in text and 'site-footer' in text and page.footer_config, name
    assert len(page.footer_config['explore']) == 7 and len(page.footer_config['find']) == 3, name
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
    assert page.favicons == ['assets/brand/jaffery-center-monogram.png'], name
    expected_monograms = 2 if name == 'community' else 1
    assert page.images.count('assets/brand/jaffery-center-monogram.png') == expected_monograms, name
    assert page.images.count('assets/brand/jaffery-center-logo-light.png') == 1, name
    expected_header_brands = 2 if name == 'community' else 1
    assert page.brand_slots == {'header': expected_header_brands, 'footer': 1}, name
    for image in (*page.images, *page.favicons):
        assert (ROOT / image).is_file(), (name, image)
    if name == 'programs':
        assert page.filters == {'all', 'faith', 'learning', 'community'}
        assert page.categories == page.filters - {'all'}
    if name == 'visit':
        assert {'contact-form', 'form-status', 'copy-status'} <= page.ids
    print(f'{name}.html: OK')
