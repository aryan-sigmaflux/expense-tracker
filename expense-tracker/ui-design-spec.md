# UI/UX Design Specification — Learning Platform (Next.js)

> Give this entire file to Claude alongside your codebase. It describes the visual system, component library, and layout logic needed to recreate the design shown in the reference image.

---

## 1. Design Philosophy

This UI is **warm, playful, and data-forward** — a learning dashboard that makes progress feel tangible and motivating. Every screen uses bold numerics, rounded cards, and a dual-tone palette to communicate energy and achievement.

Key principles:
- **Bold numbers first** — metrics are heroes, not footnotes.
- **Cards as containers** — everything lives in rounded, elevated card shells.
- **Color blocks as sections** — full-bleed background colors (coral, teal, cream, orange) define distinct zones.
- **Organic curves** — large arc/wave shapes break the grid organically.
- **Playful but not childish** — soft pastels + strong typography keep it professional.

---

## 2. Color System

```css
:root {
  /* Brand primaries */
  --color-coral:       #E8604C;   /* CTA buttons, active states, alerts */
  --color-teal:        #2A7D6E;   /* Secondary screens, progress fills */
  --color-cream:       #F5EDD8;   /* Card backgrounds, light sections */

  /* Accent colors */
  --color-purple:      #6C5CE7;   /* Featured / promoted cards */
  --color-orange:      #F5A033;   /* Course screens, warm highlights */
  --color-yellow:      #FFD166;   /* Stars, badges, highlights */
  --color-pink-soft:   #FADADD;   /* Page background, subtle fills */

  /* Neutrals */
  --color-white:       #FFFFFF;
  --color-bg-light:    #F9F7F4;   /* Main app background */
  --color-text-dark:   #1C1C2E;   /* Primary headings and body */
  --color-text-mid:    #5A5A6E;   /* Secondary labels */
  --color-text-muted:  #A0A0B8;   /* Timestamps, tertiary info */
  --color-border:      #EBEBF0;   /* Card borders, dividers */

  /* Chart colors */
  --chart-primary:     #E8604C;
  --chart-secondary:   #2A7D6E;
  --chart-bar-active:  #1C1C2E;
  --chart-bar-rest:    #D9D9E3;
}
```

### Color Usage Map

| Context | Color |
|---|---|
| Main page background | `--color-bg-light` |
| Hero/top-bar sections | `--color-coral` or `--color-teal` |
| Card surfaces | `--color-white` or `--color-cream` |
| Active pill / toggle | `--color-text-dark` (dark pill, white text) |
| Inactive toggle | `--color-white` with border |
| Featured banner | `--color-purple` |
| Course screen bg | `--color-orange` |
| Progress fill | `--color-teal` |
| Leaderboard #1 | `--color-coral` |
| Leaderboard #2 | `--color-white` |
| Leaderboard #3 | `--color-yellow` |

---

## 3. Typography

Use **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** as the primary typeface. It is geometric, modern, and has excellent weight range.

```css
/* In _app.tsx / layout.tsx */
import { Plus_Jakarta_Sans } from 'next/font/google';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-primary',
});
```

### Type Scale

```css
:root {
  --text-xs:    11px;   /* Timestamps, captions */
  --text-sm:    13px;   /* Labels, tags, nav items */
  --text-base:  15px;   /* Body / card content */
  --text-md:    17px;   /* Subheadings */
  --text-lg:    20px;   /* Card titles */
  --text-xl:    24px;   /* Section headings */
  --text-2xl:   32px;   /* Screen titles ("Learning progress") */
  --text-hero:  56px;   /* Big stat numbers (78%, 48, etc.) */
}
```

### Usage Rules

- **Hero metrics** (`78%`, `44`, `12`) → `font-size: var(--text-hero)` · `font-weight: 800` · `letter-spacing: -1px`
- **Screen titles** → `font-size: var(--text-2xl)` · `font-weight: 700`
- **Card headings** → `font-size: var(--text-lg)` · `font-weight: 600`
- **Labels/tags** → `font-size: var(--text-sm)` · `font-weight: 500` · uppercase or sentence case
- **Body copy** → `font-size: var(--text-base)` · `font-weight: 400`

---

## 4. Spacing & Layout

```css
:root {
  --radius-sm:   10px;
  --radius-md:   18px;
  --radius-lg:   24px;
  --radius-xl:   32px;
  --radius-pill: 9999px;

  --space-xs:    6px;
  --space-sm:    10px;
  --space-md:    16px;
  --space-lg:    24px;
  --space-xl:    32px;
  --space-2xl:   48px;

  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.06);
  --shadow-floating: 0 8px 32px rgba(0, 0, 0, 0.10);
}
```

### Mobile-First Grid

```css
/* Base: single column, 20px side padding */
.page-wrapper {
  max-width: 430px;     /* Phone-sized constraint */
  margin: 0 auto;
  padding: 0 20px;
}

/* Desktop: centered card or split panels */
@media (min-width: 768px) {
  .page-wrapper {
    max-width: 1200px;
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
  }
}
```

---

## 5. Component Library

### 5.1 Greeting Header

```tsx
// Appears at top of every screen
// Props: name, date?, progress?, avatar

<div className="greeting-header">
  <div className="greeting-left">
    <span className="greeting-text">Hi, {name} 👋</span>
    <span className="greeting-sub">{date}</span>   {/* optional */}
    {progress && (
      <span className="greeting-progress">
        📈 Progress: {progress}%
      </span>
    )}
  </div>
  <div className="greeting-right">
    <button className="icon-btn">🔔</button>
    <img src={avatar} className="avatar-sm" />
  </div>
</div>
```

**Styles:**
```css
.greeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
}
.greeting-text {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-dark);
}
.greeting-sub {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.avatar-sm {
  width: 38px; height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-white);
}
```

---

### 5.2 Stat Card (Mini)

Used for "44 Total / 12 Completed / 34 Upcoming" rows.

```tsx
<div className="stat-row">
  {stats.map(stat => (
    <div className="stat-item" key={stat.label}>
      <span className="stat-icon">{stat.icon}</span>
      <span className="stat-value">{stat.value}</span>
      <span className="stat-label">{stat.label}</span>
    </div>
  ))}
</div>
```

```css
.stat-row {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.stat-value {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-dark);
}
.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
```

---

### 5.3 Hero Metric Display

```tsx
<div className="hero-metric">
  <span className="hero-number">{value}%</span>
  <span className="hero-label">{label}</span>
</div>
```

```css
.hero-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hero-number {
  font-size: var(--text-hero);
  font-weight: 800;
  letter-spacing: -2px;
  color: var(--color-text-dark);
  line-height: 1;
}
.hero-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}
```

---

### 5.4 Pill Button / Toggle

```tsx
// Two variants: filled (dark) and ghost (outline)
<button className="btn-pill btn-pill--filled">Request Demo</button>
<button className="btn-pill btn-pill--ghost">Learn More</button>

// Toggle group (Weekly / Month)
<div className="toggle-group">
  <button className={active === 'weekly' ? 'toggle-active' : 'toggle-inactive'}>Weekly</button>
  <button className={active === 'month'  ? 'toggle-active' : 'toggle-inactive'}>Month</button>
</div>
```

```css
.btn-pill {
  border-radius: var(--radius-pill);
  padding: 10px 20px;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}
.btn-pill--filled {
  background: var(--color-text-dark);
  color: white;
}
.btn-pill--ghost {
  background: transparent;
  color: var(--color-text-dark);
  border: 1.5px solid var(--color-border);
}
.toggle-group {
  display: flex;
  background: rgba(255,255,255,0.2);
  border-radius: var(--radius-pill);
  padding: 3px;
  gap: 2px;
}
.toggle-active {
  background: white;
  color: var(--color-text-dark);
  border-radius: var(--radius-pill);
  padding: 6px 16px;
  font-weight: 600;
  font-size: var(--text-sm);
  border: none;
}
.toggle-inactive {
  background: transparent;
  color: rgba(255,255,255,0.8);
  border-radius: var(--radius-pill);
  padding: 6px 16px;
  font-weight: 500;
  font-size: var(--text-sm);
  border: none;
  cursor: pointer;
}
```

---

### 5.5 Card Shell

```tsx
<div className="card">
  {children}
</div>

// Colored variant
<div className="card card--coral"> ... </div>
<div className="card card--teal">  ... </div>
<div className="card card--purple"> ... </div>
```

```css
.card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
}
.card--coral  { background: var(--color-coral);  color: white; }
.card--teal   { background: var(--color-teal);   color: white; }
.card--purple { background: var(--color-purple); color: white; }
.card--cream  { background: var(--color-cream);  }
.card--orange { background: var(--color-orange); }
```

---

### 5.6 Leaderboard Item

```tsx
<div className="leaderboard-item">
  <div className={`rank-badge rank--${rank}`}>
    🏆 #{rank}
  </div>
  <img src={avatar} className="avatar-sm" />
  <div className="rank-percent">{percent}%</div>
</div>
```

```css
.leaderboard-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-sm);
}
.rank-badge {
  border-radius: var(--radius-md);
  padding: 8px 14px;
  font-weight: 700;
  font-size: var(--text-base);
}
.rank--1 { background: var(--color-coral); color: white; }
.rank--2 { background: white; color: var(--color-text-dark); border: 1.5px solid var(--color-border); }
.rank--3 { background: var(--color-yellow); color: var(--color-text-dark); }
.rank-percent {
  margin-left: auto;
  font-weight: 700;
  font-size: var(--text-md);
}
```

---

### 5.7 Progress Arc (Circular)

Use SVG or a library like `react-circular-progressbar`.

```tsx
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

<div className="progress-arc-wrapper">
  <CircularProgressbar
    value={progress}
    text={`${progress}%`}
    styles={buildStyles({
      pathColor: '#2A7D6E',
      trailColor: 'rgba(255,255,255,0.2)',
      textColor: '#1C1C2E',
      strokeLinecap: 'round',
    })}
    strokeWidth={8}
    circleRatio={0.65}        /* Arc shape, not full circle */
    rotation={0.675}
  />
</div>
```

```css
.progress-arc-wrapper {
  width: 120px;
  height: 120px;
}
```

---

### 5.8 Line Chart

Use **Recharts** (`LineChart`):

```tsx
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={120}>
  <LineChart data={data}>
    <XAxis
      dataKey="month"
      tick={{ fontSize: 11, fill: '#A0A0B8' }}
      axisLine={false}
      tickLine={false}
    />
    <Tooltip
      contentStyle={{
        background: '#1C1C2E',
        border: 'none',
        borderRadius: 12,
        color: 'white',
        fontSize: 13,
      }}
    />
    <Line
      type="monotone"
      dataKey="value"
      stroke="#E8604C"
      strokeWidth={2.5}
      dot={{ r: 4, fill: '#1C1C2E', strokeWidth: 2, stroke: 'white' }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
```

**Active dot** (the highlighted month marker): render as a dark pill label above the point.

---

### 5.9 Bar Chart

Use **Recharts** (`BarChart`):

```tsx
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={100}>
  <BarChart data={data} barSize={18}>
    <XAxis
      dataKey="day"
      tick={{ fontSize: 11, fill: '#A0A0B8' }}
      axisLine={false} tickLine={false}
    />
    <Bar dataKey="lessons" radius={[6, 6, 0, 0]}>
      {data.map((entry, index) => (
        <Cell
          key={index}
          fill={entry.active ? '#1C1C2E' : '#D9D9E3'}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

---

### 5.10 Course Card

```tsx
<div className="course-card">
  <div className="course-thumb">
    <img src={thumbnail} alt={title} />
  </div>
  <div className="course-info">
    <span className="course-eyebrow">{category}</span>
    <h3 className="course-title">{title}</h3>
    <div className="course-meta">
      <div className="avatar-stack">
        {participants.slice(0,3).map(p => <img key={p.id} src={p.avatar} />)}
      </div>
      <span className="course-count">+{extraCount}</span>
    </div>
  </div>
  <button className="icon-btn icon-btn--arrow">→</button>
</div>
```

```css
.course-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-md);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-sm);
}
.course-thumb {
  width: 56px; height: 56px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}
.course-thumb img { width: 100%; height: 100%; object-fit: cover; }
.course-eyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.course-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 2px 0;
}
.avatar-stack {
  display: flex;
}
.avatar-stack img {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -6px;
}
.avatar-stack img:first-child { margin-left: 0; }
.icon-btn--arrow {
  margin-left: auto;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--color-bg-light);
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
```

---

### 5.11 Featured Banner Card

```tsx
// Large colored card with illustration (e.g., "A series of Olympiads")
<div className="featured-banner card card--purple">
  <div className="featured-text">
    <h2 className="featured-title">{title}</h2>
    <p className="featured-desc">{description}</p>
    <button className="icon-btn icon-btn--circle-arrow">→</button>
  </div>
  <div className="featured-illustration">
    <img src={illustration} alt="" />
  </div>
</div>
```

```css
.featured-banner {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  min-height: 160px;
  position: relative;
  overflow: hidden;
}
.featured-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: white;
  line-height: 1.2;
}
.featured-desc {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.75);
  margin: 6px 0 12px;
}
.featured-illustration {
  position: absolute;
  right: -10px; bottom: -10px;
  width: 110px;
  opacity: 0.9;
}
.icon-btn--circle-arrow {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
```

---

### 5.12 Bottom Navigation Bar

```tsx
const NAV_ITEMS = [
  { icon: '⊞', label: 'Home',    href: '/' },
  { icon: '📚', label: 'Courses', href: '/courses' },
  { icon: '📊', label: 'Progress',href: '/progress' },
  { icon: '👤', label: 'Profile', href: '/profile' },
];

<nav className="bottom-nav">
  {NAV_ITEMS.map(item => (
    <Link key={item.href} href={item.href} className={`nav-item ${isActive(item.href) ? 'nav-item--active' : ''}`}>
      <span className="nav-icon">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
    </Link>
  ))}
</nav>
```

```css
.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--color-white);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;  /* 20px bottom for safe area */
  z-index: 100;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--color-text-muted);
  transition: color 0.2s;
}
.nav-item--active { color: var(--color-text-dark); }
.nav-icon { font-size: 20px; }
.nav-label { font-size: var(--text-xs); font-weight: 500; }
```

---

## 6. Screen Layouts

### 6.1 Dashboard / Home Screen

```
┌─────────────────────────────┐
│  Greeting Header            │  ← name + date + avatar
├─────────────────────────────┤
│                             │
│   CORAL BACKGROUND CARD     │  ← full-bleed coral card
│   ┌───────────┐             │
│   │ Level XX  │ Learning    │
│   │ progress  │             │
│   │           │  [arc/ring] │
│   │ 00:42/    │             │
│   │ 02:32     │             │
│   │ ▶ ♪  ≡   │             │
│   └───────────┘             │
│     ┌──────────────────┐    │
│     │  TEAL SECTION    │    │  ← teal lower section
│     └──────────────────┘    │
├─────────────────────────────┤
│  [bottom nav]               │
└─────────────────────────────┘
```

**Key details:**
- The coral card covers the top 55% of the viewport.
- A teal wave/arc shape protrudes up from the bottom of the coral area, creating an organic curve. Use an SVG `<path>` for this.
- Media controls (volume, play, playlist) sit at the bottom of the coral zone in a horizontal row.

---

### 6.2 Learning Plan Screen

```
┌─────────────────────────────┐
│  Greeting Header            │
├─────────────────────────────┤
│  [📚][📖][📅]  44  12  34  │  ← icon row + stat row
│                             │
│  78%            [Learn More]│  ← hero metric
│  Average progress           │
├─────────────────────────────┤
│                             │
│  [Line Chart - May→Sep]     │  ← recharts line chart
│   Aug dot highlighted       │
│                             │
└─────────────────────────────┘
```

---

### 6.3 Leaderboard Screen

```
┌─────────────────────────────┐
│  Leaderboard      [⋮]       │  ← heading on teal bg
│       [Weekly] [Month]      │  ← toggle on teal bg
├─────────────────────────────┤
│  🏆 #1  [avatar]   35%      │  ← coral rank badge
│     #2  [avatar]   61%      │  ← white rank badge
│     #3  [avatar]   52%      │  ← yellow rank badge
├─────────────────────────────┤
│  ┌──────────────────────┐   │
│  │ [tags] [share icon]  │   │  ← featured course chip
│  │ Accounting basics    │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

---

### 6.4 My Courses Screen

```
┌─────────────────────────────┐
│   ORANGE BACKGROUND         │
│   🎓 (illustration)         │
│   My courses                │
│   [12 Subjects] [43 Lessons]│
├─────────────────────────────┤
│  [Literature] [Math] [Bio]  │  ← horizontal tab chips
├─────────────────────────────┤
│  [Course Card 1]  →         │
│  [Course Card 2]  →         │
│  [Course Card 3]  →         │
└─────────────────────────────┘
```

---

### 6.5 Progress Screen

```
┌─────────────────────────────┐
│  Greeting Header            │
├─────────────────────────────┤
│  Progress       [All subjects ▾]
│       [Weekly] [Month]      │
│  48 lessons   12 hours      │  ← dual stat
├─────────────────────────────┤
│  [Bar Chart Mon–Fri]        │
│                             │
├─────────────────────────────┤
│  ● ● ●  (carousel dots)     │
├─────────────────────────────┤
│  [Rating of students card]  │
│  [avatar stack]  →          │
└─────────────────────────────┘
```

---

## 7. Tailwind Config (if using Tailwind CSS)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        coral:  '#E8604C',
        teal:   '#2A7D6E',
        cream:  '#F5EDD8',
        purple: '#6C5CE7',
        orange: '#F5A033',
        yellow: '#FFD166',
        'soft-pink': '#FADADD',
        'bg-light': '#F9F7F4',
        'text-dark': '#1C1C2E',
        'text-mid':  '#5A5A6E',
        'text-muted':'#A0A0B8',
      },
      borderRadius: {
        'xl':  '24px',
        '2xl': '32px',
        '3xl': '40px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        card:     '0 4px 20px rgba(0,0,0,0.06)',
        floating: '0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
};
```

---

## 8. Animation Guidelines

| Element | Animation |
|---|---|
| Cards mounting | `fade-in + slide-up` (150ms, ease-out) |
| Progress bar fill | `width` transition 800ms ease-in-out on mount |
| Line chart | Recharts `animationDuration={1000}` |
| Bar chart | Recharts `animationDuration={600}` |
| Toggle switch | Background color `transition: 200ms ease` |
| Bottom nav active | Icon scale `1 → 1.15` on tap |
| Leaderboard items | Staggered `fade-in`, 80ms delay per row |

```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeSlideUp 0.2s ease-out forwards;
}
```

**Respect reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { animation: none !important; transition: none !important; }
}
```

---

## 9. Suggested Package Dependencies

```json
{
  "dependencies": {
    "recharts": "^2.x",
    "react-circular-progressbar": "^2.x",
    "framer-motion": "^11.x",
    "clsx": "^2.x",
    "next": "^14.x",
    "react": "^18.x"
  }
}
```

---

## 10. File / Folder Structure

```
src/
├── app/
│   ├── layout.tsx              ← font + global CSS imports
│   ├── page.tsx                ← Dashboard (Screen 6.1)
│   ├── plan/page.tsx           ← Learning Plan (Screen 6.2)
│   ├── leaderboard/page.tsx    ← Leaderboard (Screen 6.3)
│   ├── courses/page.tsx        ← My Courses (Screen 6.4)
│   └── progress/page.tsx       ← Progress (Screen 6.5)
│
├── components/
│   ├── GreetingHeader.tsx
│   ├── StatRow.tsx
│   ├── HeroMetric.tsx
│   ├── PillButton.tsx
│   ├── ToggleGroup.tsx
│   ├── Card.tsx
│   ├── LeaderboardItem.tsx
│   ├── ProgressArc.tsx
│   ├── LineChartWidget.tsx
│   ├── BarChartWidget.tsx
│   ├── CourseCard.tsx
│   ├── FeaturedBanner.tsx
│   └── BottomNav.tsx
│
└── styles/
    ├── globals.css             ← CSS variables, resets, base
    └── components.css          ← Component styles (if not using Tailwind)
```

---

## 11. Quick-Start Prompt for Claude

When asking Claude to implement a specific screen, use this template:

```
Using the design spec in `ui-design-spec.md`, build the [SCREEN NAME] screen 
as a Next.js page at `src/app/[route]/page.tsx`. 

Use the color tokens, typography scale, border-radius values, and component 
patterns exactly as specified. Use Recharts for the [chart type] chart. 
Use Plus Jakarta Sans from next/font. All cards should use the `.card` 
class and its color variants as defined.

Mock data is fine for now — use realistic-looking placeholder values.
```

---

*End of design specification.*
