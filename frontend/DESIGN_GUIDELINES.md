# SchoolHub Design Guidelines

A comprehensive design system for building consistent, modern, and accessible UI components across the SchoolHub application.

---

## 🎨 Color System

### Primary Colors (Brand)

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary (Indigo)** | `#6366f1` | `#818cf8` | Primary actions, links, active states |
| **Primary Gradient** | `from-indigo-600 to-purple-600` | Same | Hero sections, CTA buttons |

### Role-Based Accent Colors

Each user role has a distinct accent color for their dashboard:

| Role | Gradient | Usage |
|------|----------|-------|
| **Admin** | `from-indigo-600 via-purple-600 to-pink-500` | Admin dashboard header, primary actions |
| **Teacher** | `from-violet-600 via-purple-600 to-fuchsia-600` | Teacher dashboard header, assignments |
| **Student** | `from-emerald-600 via-teal-600 to-cyan-600` | Student dashboard header, results |

### Semantic Colors

| Purpose | Color | Class |
|---------|-------|-------|
| Success | Emerald | `emerald-500`, `emerald-600` |
| Warning | Amber/Orange | `amber-500`, `orange-500` |
| Error | Red | `red-500`, `red-600` |
| Info | Blue | `blue-500`, `blue-600` |

### Neutral Colors

```css
/* Light Mode */
--background: oklch(1 0 0);           /* White */
--foreground: oklch(0.145 0 0);       /* Near black */
--muted: oklch(0.97 0 0);             /* Light gray */
--muted-foreground: oklch(0.556 0 0); /* Medium gray */
--border: oklch(0.922 0 0);           /* Border gray */

/* Dark Mode */
--background: oklch(0.145 0 0);       /* Near black */
--foreground: oklch(0.985 0 0);       /* Near white */
--muted: oklch(0.269 0 0);            /* Dark gray */
--muted-foreground: oklch(0.708 0 0); /* Medium gray */
--border: oklch(1 0 0 / 10%);         /* Transparent white */
```

---

## 📐 Spacing System

Use consistent spacing throughout the application:

| Size | Value | Usage |
|------|-------|-------|
| `1` | `0.25rem` (4px) | Tight gaps, icon padding |
| `2` | `0.5rem` (8px) | Small gaps, badge padding |
| `3` | `0.75rem` (12px) | Button padding, list items |
| `4` | `1rem` (16px) | Card padding, section gaps |
| `6` | `1.5rem` (24px) | Card content padding |
| `8` | `2rem` (32px) | Section spacing |
| `10` | `2.5rem` (40px) | Large section padding |
| `12` | `3rem` (48px) | Hero sections |

### Page Layout

```jsx
// Standard page container
<div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
  {/* Content */}
</div>
```

---

## 🔲 Border Radius

| Name | Value | Usage |
|------|-------|-------|
| `rounded-lg` | `0.5rem` | Buttons, inputs |
| `rounded-xl` | `0.75rem` | Small cards, badges |
| `rounded-2xl` | `1rem` | Cards, dialogs |
| `rounded-3xl` | `1.5rem` | Hero sections, large cards |
| `rounded-full` | `9999px` | Avatar, pill badges |

---

## 🌟 Component Patterns

### Cards

#### Standard Card
```jsx
<Card className="border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

#### Stat Card with Gradient
```jsx
<Card className="group overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
  <CardContent className="p-6 relative">
    {/* Background gradient decoration */}
    <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 blur-2xl rounded-full transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity duration-500`} />
    
    <div className="relative z-10">
      {/* Icon */}
      <div className={`p-3 rounded-2xl ${gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      {/* Value */}
      <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value}
      </h3>
      
      {/* Label */}
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
    </div>
  </CardContent>
</Card>
```

#### Action Card (Clickable)
```jsx
<button className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-transparent hover:shadow-lg transition-all duration-300 text-left">
  <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
    <Icon size={20} className="text-white" />
  </div>
  <div className="flex-1 min-w-0">
    <p className="font-semibold text-slate-900 dark:text-white truncate">{label}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{description}</p>
  </div>
  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
</button>
```

### Hero Sections

```jsx
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 lg:p-10">
  {/* Background pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,...")'}} />
  </div>
  
  {/* Decorative blurs */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
  <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
  
  {/* Content */}
  <div className="relative z-10">
    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
      {title}
    </h1>
    <p className="text-white/80 text-lg max-w-xl">
      {description}
    </p>
  </div>
</div>
```

### Buttons

#### Primary Button
```jsx
<Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 shadow-lg">
  {label}
</Button>
```

#### Secondary Button
```jsx
<Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
  {label}
</Button>
```

#### Ghost/Action Button
```jsx
<Button variant="ghost" className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
  {label}
  <ArrowRight size={16} />
</Button>
```

### Badges & Pills

```jsx
{/* Status badge */}
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
  <CheckCircle size={12} />
  Active
</span>

{/* Info pill */}
<div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
  <span className="text-white/60 text-sm">{label}</span>
</div>
```

### Form Inputs

```jsx
<div className={`relative rounded-xl border transition-all duration-300 ${
  focused 
    ? 'border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/10' 
    : 'border-white/10 bg-white/5 hover:border-white/20'
}`}>
  <input 
    className="w-full bg-transparent text-white text-sm p-4 rounded-xl focus:outline-none placeholder:text-white/30" 
    placeholder="Enter value..."
  />
</div>
```

---

## 📱 Loading States

### Page Loading
```jsx
<div className="flex flex-col justify-center items-center h-[80vh] gap-4">
  <div className="relative">
    <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 rounded-full" />
    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
  </div>
  <p className="text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
</div>
```

### Button Loading
```jsx
<button disabled className="relative disabled:opacity-50">
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
  <span>Loading...</span>
</button>
```

---

## ⚡ Animations

### CSS Keyframes (in index.css)

```css
/* Blob animation for backgrounds */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Fade slide in */
@keyframes fadeSlideIn {
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0px);
  }
}

.animate-element {
  animation: fadeSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}
```

### Animation Delays

```css
.animate-delay-100 { animation-delay: 100ms; }
.animate-delay-200 { animation-delay: 200ms; }
.animate-delay-300 { animation-delay: 300ms; }
/* ... up to 1400ms */
```

### Transition Classes

```jsx
// Standard hover transitions
className="transition-all duration-300"
className="transition-colors duration-200"
className="transition-transform duration-300"
className="transition-opacity duration-200"

// Hover lift effect
className="hover:-translate-y-1 transition-transform duration-300"

// Scale on hover
className="group-hover:scale-110 transition-transform duration-300"
```

---

## 🌙 Dark Mode Support

All components should support both light and dark modes using Tailwind's dark variant:

```jsx
// Background
className="bg-white dark:bg-slate-900"

// Text
className="text-slate-900 dark:text-white"
className="text-slate-500 dark:text-slate-400"

// Borders
className="border-slate-200 dark:border-slate-700"

// Shadows
className="shadow-slate-200/50 dark:shadow-slate-900/50"

// Semi-transparent backgrounds
className="bg-indigo-50 dark:bg-indigo-500/10"
```

---

## 📊 Charts (Recharts)

### Standard Chart Configuration

```jsx
<ResponsiveContainer width="100%" height={320}>
  <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
    <XAxis 
      dataKey="name" 
      axisLine={false} 
      tickLine={false} 
      tick={{ fill: '#64748b', fontSize: 12 }} 
    />
    <YAxis 
      axisLine={false} 
      tickLine={false} 
      tick={{ fill: '#64748b', fontSize: 12 }} 
    />
    <Tooltip 
      contentStyle={{ 
        borderRadius: '12px', 
        border: 'none', 
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' 
      }}
    />
    <Area 
      type="monotone" 
      dataKey="value" 
      stroke="#6366f1" 
      strokeWidth={2}
      fill="url(#gradient)" 
    />
  </AreaChart>
</ResponsiveContainer>
```

---

## 📝 Typography

### Font Weights
- `font-medium` (500) - Labels, secondary text
- `font-semibold` (600) - Buttons, important labels
- `font-bold` (700) - Headings, values

### Text Sizes
- `text-xs` (12px) - Badges, helper text
- `text-sm` (14px) - Body text, labels
- `text-base` (16px) - Standard body
- `text-lg` (18px) - Subheadings
- `text-xl` (20px) - Section titles
- `text-2xl` (24px) - Values, counters
- `text-3xl` (30px) - Page titles
- `text-4xl` (36px) - Hero titles

### Tracking
- `tracking-tight` - Headlines, large text
- Default - Body text

---

## ✅ Accessibility Guidelines

1. **Color Contrast**: Ensure all text meets WCAG 2.1 AA standards
2. **Focus States**: Use visible focus indicators
3. **Keyboard Navigation**: All interactive elements must be keyboard accessible
4. **Screen Readers**: Use proper ARIA labels and semantic HTML
5. **Motion**: Respect `prefers-reduced-motion` for animations

```jsx
// Focus visible state
className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"

// Skip to main content link
<a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>
```

---

## 📁 File Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI primitives (Button, Card, Input, etc.)
│   └── ...           # Feature-specific components
├── pages/
│   ├── admin/        # Admin dashboard pages
│   ├── teacher/      # Teacher dashboard pages
│   ├── student/      # Student dashboard pages
│   └── LoginPage.jsx
├── lib/
│   └── utils.js      # Utility functions (cn helper)
└── index.css         # Global styles, animations
```

---

## 🔧 Utility Classes

### Common Utility Patterns

```jsx
// Gradient text
className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"

// Glass effect
className="bg-white/20 backdrop-blur-sm border border-white/20"

// Truncate text
className="truncate"
className="line-clamp-2"

// Flex center
className="flex items-center justify-center"

// Absolute positioning with blur
className="absolute inset-0 blur-3xl opacity-30"
```

---

## 📋 Checklist for New Pages

When creating a new page, ensure:

- [ ] Uses consistent spacing (`p-6 lg:p-8 space-y-8`)
- [ ] Has proper max-width container (`max-w-7xl mx-auto`)
- [ ] Includes role-appropriate hero section with gradient
- [ ] Cards use `border-0` with shadow styling
- [ ] All colors support dark mode
- [ ] Loading state implemented
- [ ] Error state implemented
- [ ] Animations use staggered delays
- [ ] Icons have consistent sizing
- [ ] Typography follows hierarchy
- [ ] Interactive elements have hover states

---

*Last Updated: November 2025*
