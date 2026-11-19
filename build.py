"""Generate the static pages. Content lives here. Run `python3 build.py` after editing, then commit the HTML."""
from html import escape
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).parent
SITE = 'Jaffery Center of Roanoke'
EMAIL = 'jafferycenter@gmail.com'
ADDRESS_1 = '3031 Preston Avenue NW'
ADDRESS_2 = 'Roanoke, VA 24012'
MAP_URL = 'https://www.google.com/maps/search/?api=1&query=3031+Preston+Avenue+NW+Roanoke+VA+24012'
ORIGINAL = 'https://www.jafferycenter.org'
PAYPAL = 'https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=G4QYMJA5YGT8G&source=url'
VENMO = 'https://venmo.com/code?user_id=4614352028042942654&created=1780858500.261365&printed=1'
SIGNUP = 'https://grasshoppersignup.com/s/rrjq9a'
YOUTUBE = 'https://www.youtube.com/@jafferycenter5663'
PARENTS = ORIGINAL + '/sunday-school/parents-guide'
BLOG = ORIGINAL + '/blog'
POSTS = [
    ('a-simple-introduction-to-islam', 'A Simple Introduction to Islam'),
    ('we-live-in-a-world-that-is-louder-than-ever', 'We live in a world that is louder than ever'),
    ('what-religion-does-to-a-person', 'What Religion Does to a Person'),
    ('what-is-ashura-and-why-it-still-matters-today', 'What is Ashura, and Why it Still Matters Today'),
    ('how-to-reward-your-child-for-learning', 'How to Reward Your Child for Learning'),
    ('how-to-lock-an-iphone-to-one-app-for-kids-using-guided-access', 'How to Lock an iPhone to One App for Kids Using “Guided Access”'),
    ('why-teaching-your-child-to-read-early-is-the-best-investment', 'Why Teaching Your Child to Read Early Is the Best Investment'),
    ('how-to-raise-a-child-who-naturally-loves-the-quran', 'How to Raise a Child Who Naturally Loves the Quran'),
]
NAV = [('programs.html', 'Programs'), ('sunday-school.html', 'Sunday School'), ('community.html', 'Community'),
       ('about.html', 'About'), ('visit.html', 'Visit')]


def mailto(subject, body=''):
    q = f'subject={quote(subject)}' + (f'&body={quote(body)}' if body else '')
    return f'mailto:{EMAIL}?{q}'


WHATSAPP = mailto('WhatsApp Group Request', 'Full name:\nMobile number:\nCity and state:\nA little about me and my family:')

MONO = '<img class="mark" src="assets/brand/jaffery-center-monogram.png" width="46" height="46" alt="">'

# the mihrab, as two dithered ink layers; wide crop on desktop, tall crop on phones
# per page: where the arch sits across the strip (ox), how far down the scene the window slides (oy, in arch
# radii), mirror, and the noise seed. Every page shows a different part of the same arch.
POS = {'programs.html': (.40, -.70, 1, 3), 'muharram.html': (.60, .05, 1, 7), 'sunday-school.html': (.62, .90, 1, 13),
       'community.html': (.42, 1.40, -1, 19), 'about.html': (.55, .40, 1, 23), 'visit.html': (.50, 2.20, 1, 29),
       'donate.html': (.58, -.10, -1, 31)}


ART_LAYERS = '<div class="dots a"></div><div class="dots b"></div>'   # art.js paints these with the dot-dither kit


def fix_levels(body):
    """A page whose first sub-heading is an h3 under the h1 gets h2 instead, so the outline never skips a level."""
    i3, i2 = body.find('<h3'), body.find('<h2')
    if i3 != -1 and (i2 == -1 or i3 < i2):
        body = body.replace('<h3', '<h2').replace('</h3>', '</h2>')
    return body


def strip(file):
    ox, oy, flip, seed = POS.get(file, (.5, 0, 1, 1))
    return (f'<div class="strip art-box" aria-hidden="true" data-art="strip" data-ox="{ox}" data-oy="{oy}" '
            f'data-flip="{flip}" data-seed="{seed}">{ART_LAYERS}</div>')


ARROW = '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>'


def _where():
    return (f'<p class="where"><strong>{ADDRESS_1}, {ADDRESS_2}</strong> '
            f'<a class="tlink" href="{MAP_URL}" target="_blank" rel="noopener noreferrer">Directions{ARROW}</a></p>')


def a(label, href, cls='', ext=False):
    extra = ' target="_blank" rel="noopener noreferrer"' if ext else ''
    c = f' class="{cls}"' if cls else ''
    return f'<a{c} href="{escape(href)}"{extra}>{label}</a>'


def btn(label, href, kind='primary', ext=False):
    return a(f'{label}{ARROW}', href, f'btn btn-{kind}', ext)


CUR = ' aria-current="page"'


def header(active):
    links = ''.join(
        f'<li><a href="{h}"{CUR if h == active else ""}>{t}</a></li>' for h, t in NAV)
    give_cur = ' aria-current="page"' if active == 'donate.html' else ''
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="bar">
  <div class="wrap bar-in">
    <a class="brand" href="index.html" aria-label="{SITE}, home">{MONO}<span class="brand-name">Jaffery Center<small>of Roanoke</small></span></a>
    <nav class="nav" aria-label="Main">
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list">Menu</button>
      <ul id="nav-list">{links}<li class="nav-give"><a class="btn btn-line btn-sm" href="donate.html"{give_cur}>Give</a></li></ul>
    </nav>
  </div>
</header>'''


def footer():
    return f'''<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-name">
      <img class="foot-mark" src="assets/brand/mihrab-reverse.svg" width="56" height="56" alt="">
      <p class="foot-big">Jaffery Center<br>of Roanoke</p>
    </div>
    <address class="foot-col">
      <p class="label">Find us</p>
      <p><span class="nw">{ADDRESS_1}</span><br>{ADDRESS_2}</p>
      <p>{a(EMAIL, 'mailto:' + EMAIL)}</p>
      <p>{a('Open in Maps', MAP_URL, '', True)}</p>
    </address>
    <div class="foot-col">
      <p class="label">The center</p>
      <ul class="plain">
        <li>{a('Programs', 'programs.html')}</li><li>{a('Muharram 2026', 'muharram.html')}</li><li>{a('Sunday School', 'sunday-school.html')}</li>
        <li>{a('Community', 'community.html')}</li><li>{a('About', 'about.html')}</li><li>{a('Visit and contact', 'visit.html')}</li><li>{a('Give', 'donate.html')}</li>
      </ul>
    </div>
    <div class="foot-col">
      <p class="label">Elsewhere</p>
      <ul class="plain">
        <li>{a('Blog', BLOG, '', True)}</li><li>{a('Parents Guide', PARENTS, '', True)}</li><li>{a('YouTube', YOUTUBE, '', True)}</li><li>{a('Previous website', ORIGINAL, '', True)}</li>
      </ul>
    </div>
  </div>
  <div class="wrap foot-end">
    <p class="label">Nonprofit 501(c)(3) · EIN 81-1064023 · © 2026 {SITE}</p>
  </div>
</footer>'''


def page(file, title, desc, body, bodyclass=''):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} | {SITE}</title>
<meta name="description" content="{escape(desc)}">
<meta name="theme-color" content="#E7EAE5">
<meta property="og:title" content="{escape(title)} | {SITE}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:image" content="https://jaffery-center-website.vercel.app/og.jpg">
<link rel="icon" href="assets/brand/jc-favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Big+Shoulders+Display:wght@700;800&family=Space+Mono&display=swap">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap">
<link rel="stylesheet" href="styles.css">
<noscript><style>.art-box{{background:radial-gradient(circle,var(--ink) 1.3px,transparent 1.7px) 0 0/9px 9px,var(--paper)}}</style></noscript>
</head>
<body class="{bodyclass}">
{header(file if file != 'muharram.html' else 'programs.html')}
<main id="main">
{fix_levels(body).replace('<!--STRIP-->', strip(file))}
</main>
{footer()}
<script type="module" src="site.js"></script>
</body>
</html>
'''


WHERE = _where()


def hero_head(h1, lede, actions=''):
    return f'''<section class="phead">
  <div class="wrap">
    <h1 class="display">{h1}</h1>
    <div class="phead-side"><p class="lede">{lede}</p>{WHERE}{('<div class="actions">' + actions + '</div>') if actions else ''}</div>
  </div>
</section>
<!--STRIP-->'''


def row(title, text, link=''):
    return f'''<li class="row"><h3>{title}</h3><div class="row-body"><p>{text}</p>{link}</div></li>'''


def band_verse(arabic, english, cite):
    return f'''<section class="band verse{'' if arabic else ' solo'}">
  <div class="wrap">
    {('<p class="arabic big" lang="ar" dir="rtl">' + arabic + '</p>') if arabic else ''}
    <blockquote><p>{english}</p><footer class="label">{cite}</footer></blockquote>
  </div>
</section>'''


PAGES = {}

# ---------------------------------------------------------------- home
PAGES['index.html'] = ('A Muslim community center in Roanoke',
    'Jaffery Center of Roanoke is a nonprofit Shia Muslim community center at 3031 Preston Avenue NW in Roanoke, Virginia. Sunday School, Muharram, Ramadan, Eid and family gatherings.',
    f'''
<section class="hero">
  <div class="hero-grid">
    <div class="hero-copy">
      <h1 class="display hero-h1">A Muslim community center in Roanoke</h1>
      <p class="where"><strong>{ADDRESS_1}, {ADDRESS_2}</strong> {a('Directions' + ARROW, MAP_URL, 'tlink', True)}</p>
      <p class="lede">Qur’an and Arabic classes for children, Muharram and Ramadan programs, Eid, and shared meals. For families in Roanoke, the New River Valley and the towns around them.</p>
      <div class="actions">{btn('Plan a visit', 'visit.html')}{btn('Give', 'donate.html', 'line')}</div>
    </div>
    <figure class="plate" aria-label="Illustration of a mihrab, drawn for this site">
      <div class="plate-art art-box" aria-hidden="true" data-art="hero" data-ox=".5" data-seed="11">{ART_LAYERS}</div>
      <figcaption class="note">A mihrab drawn for this site. It is not a photograph of the center.</figcaption>
    </figure>
  </div>
</section>

<section class="facts" aria-label="At a glance">
  <dl class="wrap facts-in">
    <div><dt class="label">Address</dt><dd><span class="nw">{ADDRESS_1}</span><br>{ADDRESS_2}</dd></div>
    <div><dt class="label">Sunday School</dt><dd>Small classes, 6 to 18 students</dd></div>
    <div><dt class="label">Write to us</dt><dd>{a(EMAIL, 'mailto:' + EMAIL)}</dd></div>
    <div><dt class="label">Serving</dt><dd>Roanoke, the New River Valley and nearby towns</dd></div>
  </dl>
</section>

<section class="block">
  <div class="wrap">
    <h2 class="h2">What happens here</h2>
    <ul class="rows">
      {row('Sunday School', 'Volunteer teachers run small classes for children: Arabic reading, Qur’an recitation and pronunciation, and Islamic studies.', a('About Sunday School' + ARROW, 'sunday-school.html', 'tlink'))}
      {row('Muharram', 'Daily majlis, matam, and dua and ziyarat, with food served every night. Muharram 2026 ran June 16 to June 28.', a('Muharram 2026' + ARROW, 'muharram.html', 'tlink'))}
      {row('Ramadan and Eid', 'Lectures, worship and community gatherings during Ramadan, Eid and other special occasions.', a('All programs' + ARROW, 'programs.html', 'tlink'))}
      {row('Family gatherings', 'Meals, celebrations and family-friendly evenings to meet other Muslims in the Roanoke area.', a('Join the community' + ARROW, 'community.html', 'tlink'))}
    </ul>
  </div>
</section>

{band_verse('وَٱعْتَصِمُوا۟ بِحَبْلِ ٱللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا۟', '“And hold firmly to the rope of Allah all together and do not become divided.”', 'Qur’an 3:103, part of the verse')}

<section class="block split">
  <div class="wrap split-in">
    <div>
      <h2 class="h2">New to Roanoke, or new to Islam?</h2>
      <p class="lede">We would be honored to welcome you. Visit the center, ask for the current program schedule, or write to us with any question.</p>
    </div>
    <div class="stack">
      <p>To join the community WhatsApp group, email an introduction with your name, mobile number, and city and state.</p>
      <div class="actions">{btn('Request WhatsApp access', WHATSAPP)}{btn('Visit and contact', 'visit.html', 'line')}</div>
    </div>
  </div>
</section>
''')

# ---------------------------------------------------------------- programs
PAGES['programs.html'] = ('Programs',
    'Muharram, Ramadan, Eid, Sunday School, Qur’an and Arabic, and family gatherings at the Jaffery Center of Roanoke.',
    hero_head('Programs through the year', 'Faith and community come to life through programs, education and shared celebrations. Dates change through the year, so ask the center for the current schedule.', btn('Ask for the schedule', mailto('Program schedule')))
    + f'''
<section class="block"><div class="wrap">
  <ul class="rows">
    {row('Muharram', 'Lectures, supplications, remembrance and reflection on the life, sacrifice and message of Imam Hussain, peace be upon him. Food is served nightly and all are welcome.', a('Muharram 2026' + ARROW, 'muharram.html', 'tlink'))}
    {row('Ramadan', 'Come together during the blessed month for worship, learning and community.')}
    {row('Eid gatherings', 'Celebrate meaningful occasions and the joy of being together with friends and family.')}
    {row('Sunday School', 'A supportive weekly learning environment for children to explore faith, Qur’an and Arabic.', a('About Sunday School' + ARROW, 'sunday-school.html', 'tlink'))}
    {row('Qur’an and Arabic', 'Helping children build confidence with Arabic reading and proper Qur’an pronunciation.')}
    {row('Family gatherings', 'Shared meals and family-friendly opportunities to build friendships in the Roanoke community.')}
  </ul>
</div></section>
<section class="band"><div class="wrap split-in">
  <div><h2 class="h2">What’s coming up?</h2></div>
  <div class="stack"><p>Event schedules change throughout the year. Email us to request access to the community WhatsApp group for current announcements.</p>
  <div class="actions">{btn('Request updates', WHATSAPP, 'primary')}</div></div>
</div></section>
''')

# ---------------------------------------------------------------- muharram
PAGES['muharram.html'] = ('Muharram 2026',
    'Muharram Programs 2026 at the Jaffery Center of Roanoke: June 16 to June 28, 2026, with Sheikh Hamza Saudagar. Daily majlis, matam, dua and ziyarat.',
    f'''
<section class="phead">
  <div class="wrap">
    <h1 class="display">Muharram Programs 2026</h1>
    <div class="phead-side">
      <p class="lede">June 16 to June 28, 2026, with Sheikh Hamza Saudagar. Programs began daily before Maghrib prayers.</p>
      {WHERE}
      <p class="notice"><strong>This program has ended.</strong> The next dates are not posted yet. Write to the center or ask for the WhatsApp group to hear when they are.</p>
      <div class="actions">{btn('Ask about next Muharram', mailto('Muharram dates'))}{btn('Request WhatsApp access', WHATSAPP, 'line')}</div>
    </div>
  </div>
</section>
<!--STRIP-->
<section class="block"><div class="wrap">
  <h2 class="h2">What the nights held</h2>
  <ul class="rows">
    {row('Daily majlis', 'Held every day from June 16 to June 28, 2026, beginning before Maghrib prayers, with Sheikh Hamza Saudagar.')}
    {row('Matam, dua and ziyarat', 'Part of the program each day.')}
    {row('Food', 'Served every night of the program.')}
  </ul>
</div></section>
{band_verse('', '“Hussain is from me, and I am from Hussain.”', 'Prophet Muhammad, peace be upon him and his family. Part of a longer narration reported in Sunan al-Tirmidhi and Sunan Ibn Majah.')}
<section class="block split"><div class="wrap split-in">
  <div><h2 class="h2">Hospitality</h2></div>
  <div class="stack">
    <p>Food was served nightly, and all were welcome. We warmly invited individuals and families to attend, learn and connect with the community.</p>
    <p>Contributions of food, drinks, desserts and supplies are greatly appreciated. They help the center provide hospitality for both the brothers’ and sisters’ side.</p>
    <p class="links">{a('Why Ashura still matters today' + ARROW, ORIGINAL + '/blog/what-is-ashura-and-why-it-still-matters-today', 'tlink', True)}{a('The original Muharram 2026 page' + ARROW, ORIGINAL + '/muharam-2026-program', 'tlink', True)}</p>
    <p class="small">Location: {SITE}, {ADDRESS_1}, {ADDRESS_2}.</p>
  </div>
</div></section>
''')

# ---------------------------------------------------------------- sunday school
PAGES['sunday-school.html'] = ('Sunday School',
    'Sunday School at the Jaffery Center of Roanoke: small classes of 6 to 18 students with volunteer teachers. Arabic reading, Qur’an recitation and pronunciation, Islamic studies.',
    hero_head('Small classes. Lasting foundations.', 'Our Sunday School gives children a positive place to learn about Islam, the Qur’an, and the teachings of Prophet Muhammad (peace be upon him and his pure family).',
              btn('Sign up', SIGNUP, 'primary', True) + btn('Email about registration', mailto('Sunday School registration'), 'line'))
    + f'''
<section class="facts"><dl class="wrap facts-in">
  <div><dt class="label">Registration</dt><dd>By email</dd></div>
  <div><dt class="label">Class size</dt><dd>6 to 18 students per class</dd></div>
  <div><dt class="label">Teachers</dt><dd>Volunteers</dd></div>
  <div><dt class="label">Subjects</dt><dd>Qur’an recitation, Arabic reading, Islamic studies</dd></div>
</dl></section>
<section class="block split"><div class="wrap split-in">
  <div><h2 class="h2">Room to learn at their own pace</h2></div>
  <div class="stack">
    <p>Our volunteer teachers support children as they build a strong foundation in Qur’an recitation, Arabic reading and Islamic studies. Special attention is given to helping English-speaking students practice proper pronunciation step by step.</p>
    <p>Classes are intentionally small, typically 6 to 18 students, so teachers can provide individual attention and encouragement.</p>
    <p>We want children to build confidence, develop Islamic character, and form a meaningful connection with their faith, community and the Book of Allah.</p>
  </div>
</div></section>
<section class="block"><div class="wrap">
  <h2 class="h2">What children learn</h2>
  <ul class="rows">
    {row('Read with confidence', 'Students learn to recognize and read Arabic, with patient guidance that meets them where they are.')}
    {row('Connect with the Qur’an', 'Lessons support recitation and proper pronunciation in an encouraging environment.')}
    {row('Live their values', 'Islamic studies help children understand their faith and grow in character and community.')}
  </ul>
</div></section>
<section class="block"><div class="wrap">
  <h2 class="h2">Questions from families</h2>
  <dl class="qa">
    <dt>How do I register my child?</dt><dd>Use the sign-up page, or email {a(EMAIL, 'mailto:' + EMAIL)} to ask about registration, availability and the current schedule.</dd>
    <dt>How big are the classes?</dt><dd>Typically 6 to 18 students, so volunteer teachers can give children individual attention.</dd>
    <dt>Does my child need to know Arabic already?</dt><dd>Classes focus on helping English-speaking students build a foundation in Arabic reading and Qur’an pronunciation. Email the center to discuss your child’s needs.</dd>
    <dt>How can we practice at home?</dt><dd>Regular short review sessions help children build confidence over time. Ask the teachers what your child is currently learning so you can practice together.</dd>
  </dl>
</div></section>
<section class="band"><div class="wrap split-in">
  <div><h2 class="h2">For parents</h2></div>
  <div class="stack">
    <p>The center’s Parents Guide, and its blog posts on raising children who love learning and the Qur’an, are on the previous website.</p>
    <div class="actions">{btn('Parents Guide', PARENTS, 'primary', True)}{btn('Read the blog', BLOG, 'line', True)}</div>
  </div>
</div></section>
''')

# ---------------------------------------------------------------- community
posts = ''.join(f'<li>{a(t + ARROW, ORIGINAL + "/blog/" + s, "tlink", True)}</li>' for s, t in POSTS)
PAGES['community.html'] = ('Community',
    'Join the Jaffery Center community in Roanoke: the WhatsApp group, the center’s blog and YouTube channel.',
    hero_head('Join the community', 'The community WhatsApp group shares announcements about programs, Sunday School, schedule updates and special occasions.',
              btn('Request WhatsApp access', WHATSAPP))
    + f'''
<section class="block split"><div class="wrap split-in">
  <div><h2 class="h2">How to join the group</h2></div>
  <div class="stack">
    <p>To request access, email the center with a brief introduction.</p>
    <ul class="plain steps">
      <li><strong>Introduce yourself.</strong> Include your full name, mobile number, and city and state of residence.</li>
      <li><strong>Share a little more.</strong> Tell us about yourself and your family, how you heard about the center, and what you hope to find in the community.</li>
    </ul>
  </div>
</div></section>
<section class="block"><div class="wrap">
  <h2 class="h2">From the center’s blog</h2>
  <ul class="plain blog">{posts}</ul>
  <p class="actions">{btn('All posts', BLOG, 'line', True)}{btn('YouTube channel', YOUTUBE, 'line', True)}</p>
</div></section>
{band_verse('وَتَعَاوَنُوا۟ عَلَى ٱلْبِرِّ وَٱلتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا۟ عَلَى ٱلْإِثْمِ وَٱلْعُدْوَٰنِ', '“And cooperate in righteousness and piety, but do not cooperate in sin and aggression.”', 'Qur’an 5:2, part of the verse')}
''')

# ---------------------------------------------------------------- about
PAGES['about.html'] = ('About',
    'The Jaffery Center of Roanoke is a nonprofit Shia Muslim community organization providing a welcoming space for faith, education, family and community.',
    hero_head('Rooted in faith. Growing together.', 'A community built through worship, learning, service and meaningful relationships in Roanoke.', btn('Get in touch', 'visit.html'))
    + f'''
<section class="block split"><div class="wrap split-in">
  <div><h2 class="h2">Our purpose</h2></div>
  <div class="stack">
    <p>The Jaffery Center of Roanoke is a nonprofit Shia Muslim community organization. Our mission is to provide a welcoming space for faith, education, family and community. Everyone is welcome, whether you are a lifelong member, new to Roanoke, exploring Islam, or simply looking for community.</p>
    <p>Through religious programs, Sunday School, educational events and gatherings, we seek to strengthen our connection to Allah, the Qur’an, and the teachings of Prophet Muhammad (peace be upon him and his pure family).</p>
    <p>We serve the Muslim community in Roanoke and the New River Valley. Our goal is to help families stay connected to faith, build friendships, and grow together in a welcoming Islamic environment.</p>
  </div>
</div></section>
{band_verse('وَٱعْتَصِمُوا۟ بِحَبْلِ ٱللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا۟ ۚ وَٱذْكُرُوا۟ نِعْمَتَ ٱللَّهِ عَلَيْكُمْ إِذْ كُنتُمْ أَعْدَآءً فَأَلَّفَ بَيْنَ قُلُوبِكُمْ فَأَصْبَحْتُم بِنِعْمَتِهِۦٓ إِخْوَٰنًا', '“And hold firmly to the rope of Allah all together and do not become divided. And remember the favor of Allah upon you when you were enemies and He brought your hearts together, and you became brothers by His grace.”', 'Qur’an 3:103, part of the verse')}
<section class="block"><div class="wrap">
  <h2 class="h2">What brings us together</h2>
  <ul class="rows">
    {row('Faith and reflection', 'Programs for Muharram, Ramadan, Eid and other significant Islamic occasions.')}
    {row('Knowledge and growth', 'Islamic education and Qur’an learning that help the next generation grow.')}
    {row('Community and care', 'Family gatherings and lasting connections among neighbors in Roanoke.')}
  </ul>
  <p class="actions">{btn('Get in touch', 'visit.html')}</p>
</div></section>
''')

# ---------------------------------------------------------------- visit
topics = ['General question', 'Sunday School inquiry', 'Upcoming programs', 'Volunteering', 'Visiting the center']
tl = ''.join(f'<li>{a(t + ARROW, mailto(t), "tlink")}</li>' for t in topics)
PAGES['visit.html'] = ('Visit and contact',
    'Find the Jaffery Center of Roanoke at 3031 Preston Avenue NW, Roanoke, VA 24012, or email jafferycenter@gmail.com.',
    hero_head('Come visit', 'Whether you are new to the area, interested in a program, or just want to connect, you are welcome. For a specific program, check current announcements. Program times vary.',
              btn('Open directions', MAP_URL, 'primary', True))
    + f'''
<section class="facts"><dl class="wrap facts-in">
  <div><dt class="label">Location</dt><dd>{SITE}<br><span class="nw">{ADDRESS_1}</span><br>{ADDRESS_2}<br><button class="copy" type="button" data-copy="3031 Preston Avenue NW, Roanoke, VA 24012">Copy address</button></dd></div>
  <div><dt class="label">Email</dt><dd>{a(EMAIL, 'mailto:' + EMAIL)}</dd></div>
  <div><dt class="label">Updates</dt><dd>{a('Request the WhatsApp group', WHATSAPP)}</dd></div>
</dl></section>
<section class="block split"><div class="wrap split-in">
  <div><h2 class="h2">Send a note</h2><p class="small">These links open your email app with the subject filled in. Nothing is sent or stored by this website.</p></div>
  <ul class="plain blog">{tl}</ul>
</div></section>
''')

# ---------------------------------------------------------------- donate
PAGES['donate.html'] = ('Give',
    'Support the Jaffery Center of Roanoke by PayPal, Venmo or Zelle. Donations support Islamic education, youth programs, community gatherings and facility maintenance.',
    hero_head('Give to the center', 'Every prayer, class and gathering is made possible through the generosity of people who care about this community.',
              btn('Give with PayPal', PAYPAL, 'primary', True))
    + f'''
<section class="block split"><div class="wrap split-in">
  <div><h2 class="h2">Where it goes</h2></div>
  <div class="stack">
    <p>Donations support Islamic education, youth programs, community gatherings, facility maintenance and the continued growth of a welcoming Muslim community in Roanoke and the New River Valley.</p>
    <p>The Jaffery Center of Roanoke is a nonprofit 501(c)(3) organization (EIN 81-1064023). For tax or receipt questions, please contact the center directly.</p>
  </div>
</div></section>
<section class="block"><div class="wrap">
  <h2 class="h2">Ways to give</h2>
  <ul class="rows">
    {row('PayPal', 'Give by card or PayPal balance through the center’s PayPal donation page.', a('Give with PayPal' + ARROW, PAYPAL, 'tlink', True))}
    {row('Venmo', 'Open the center’s Venmo code to pay from the Venmo app.', a('Open Venmo code' + ARROW, VENMO, 'tlink', True))}
    {row('Zelle', 'The center takes Zelle through a QR code. It is shown on the Donate page of the previous website, which also lists the other options.', a('See the Zelle code' + ARROW, ORIGINAL + '/donate', 'tlink', True))}
    {row('Food and supplies', 'Contributions of food, drinks, desserts and supplies help the center provide hospitality during Muharram and other gatherings.', a('Ask about helping' + ARROW, mailto('Volunteering and contributions'), 'tlink'))}
  </ul>
</div></section>
{band_verse('مَّن ذَا ٱلَّذِى يُقْرِضُ ٱللَّهَ قَرْضًا حَسَنًا فَيُضَـٰعِفَهُۥ لَهُۥٓ أَضْعَافًا كَثِيرَةً ۚ وَٱللَّهُ يَقْبِضُ وَيَبْصُۜطُ وَإِلَيْهِ تُرْجَعُونَ', '“Who is it that will lend Allah a goodly loan so He may multiply it many times over for them? And Allah withholds and grants abundance, and to Him you will be returned.”', 'Qur’an 2:245')}
''')

if __name__ == '__main__':
    for fname, (title, desc, body) in PAGES.items():
        (ROOT / fname).write_text(page(fname, title, desc, body), encoding='utf-8')
    print('wrote', len(PAGES), 'pages')
