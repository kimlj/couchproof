# Couchproof Dashboard Layout Guide

## Overview

This dashboard layout system provides a modern, glass morphism dark-themed interface with responsive navigation for both mobile and desktop experiences.

## Components

### 1. Header (`src/components/layout/Header.tsx`)

Desktop-focused header component with:
- Gradient "Couchproof" logo
- User avatar dropdown menu
- Mobile hamburger menu toggle
- Glass morphism background with backdrop blur

**Features:**
- Animated dropdown menu with Framer Motion
- Responsive logo (full text on desktop, icon on mobile)
- User profile with settings and logout options
- Fixed positioning that adjusts for sidebar on desktop

**Usage:**
```tsx
<Header
  user={{
    name: "John Doe",
    email: "john@example.com",
    avatar: "/path/to/avatar.jpg" // optional
  }}
  onLogout={() => handleLogout()}
  onMobileMenuToggle={() => setMenuOpen(!menuOpen)}
  isMobileMenuOpen={menuOpen}
/>
```

### 2. BottomNav (`src/components/layout/BottomNav.tsx`)

Mobile-only bottom navigation bar with:
- 4 main tabs: Dashboard, Activities, Insights, Play
- Lucide React icons
- Active state with animated cyan indicator
- Safe area padding for notched phones

**Features:**
- Animated active indicator with layout transitions
- Glass morphism background
- Fixed bottom positioning
- Automatically hidden on desktop (lg breakpoint)

**Navigation Items:**
- Dashboard: `/dashboard`
- Activities: `/dashboard/activities`
- Insights: `/dashboard/insights`
- Play: `/dashboard/play`

### 3. Sidebar (`src/components/layout/Sidebar.tsx`)

Desktop sidebar with mobile drawer support:
- Same navigation items as bottom nav
- User profile section at bottom
- Settings link
- Logout button
- Collapsible on mobile with overlay

**Features:**
- Animated active indicator on left edge
- Glass morphism background
- Mobile slide-in drawer with backdrop
- User avatar and info display
- Smooth transitions

**Usage:**
```tsx
<Sidebar
  user={{
    name: "John Doe",
    email: "john@example.com"
  }}
  onLogout={() => handleLogout()}
  isOpen={isMobileMenuOpen}
  onClose={() => setMobileMenuOpen(false)}
/>
```

### 4. PageContainer (`src/components/layout/PageContainer.tsx`)

Wrapper component for page content with:
- Responsive padding (mobile bottom nav, desktop header)
- Max-width container options
- Scroll behavior
- Background color

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' (default: '2xl')
- `noPadding`: boolean (default: false)
- `className`: string (optional)

**Usage:**
```tsx
<PageContainer maxWidth="xl">
  <YourContent />
</PageContainer>
```

### 5. Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

Main layout wrapper for dashboard pages:
- Protected route (redirects if not authenticated)
- Combines Header, Sidebar, and BottomNav
- Handles mobile menu state
- Loading state during auth check

**Features:**
- Authentication check on mount
- Responsive layout switching
- Mobile menu state management
- Smooth transitions between states

## Design System

### Colors
```css
Primary: bg-slate-900 (background)
Secondary: bg-slate-800/50 (cards)
Border: border-slate-700/50
Text: text-white, text-slate-300, text-slate-400
Gradients: from-cyan-500 via-purple-500 to-pink-500
```

### Glass Morphism Effect
```tsx
<div className="absolute inset-0 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50" />
```

### Typography Scale
- Display: text-4xl (36px)
- H1: text-3xl (30px)
- H2: text-2xl (24px)
- H3: text-xl (20px)
- Body: text-base (16px)
- Small: text-sm (14px)

### Spacing
- 0.25rem (4px) - Tight
- 0.5rem (8px) - Small
- 1rem (16px) - Medium
- 1.5rem (24px) - Large
- 2rem (32px) - XL
- 3rem (48px) - 2XL

### Border Radius
- Buttons: rounded-lg (8px)
- Cards: rounded-2xl (16px)
- Avatars: rounded-full

## Responsive Breakpoints

- Mobile: < 1024px (shows BottomNav, hides Sidebar)
- Desktop: >= 1024px (shows Sidebar + Header, hides BottomNav)

## Animation

All animations use Framer Motion:
- Active indicators: Spring animations
- Dropdowns: Opacity + scale transitions
- Page content: Staggered fade-in
- Progress bars: Width animations

## Safe Area Support

Mobile devices with notches are supported via:
```tsx
<div className="pb-safe">
  {/* Content with safe area padding */}
</div>
```

## Icons

Using Lucide React icons:
- Home (Dashboard)
- Activity (Activities)
- Brain (Insights)
- Trophy (Play)
- Settings
- User
- LogOut

## Authentication Integration

The layout includes placeholder auth logic. Replace with your actual auth:

```tsx
// In layout.tsx
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  };
  checkAuth();
}, []);
```

## PWA Optimization

- Safe area padding for notched devices
- Responsive viewport handling
- Touch-friendly tap targets (min 44px)
- Optimized for screenshot sharing (9:16 ratio)

## State Management

The layout manages:
- Mobile menu open/close state
- Authentication state
- Loading state
- Active navigation item (via pathname)

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Semantic HTML structure
- Color contrast compliance (WCAG AA)

## Performance

- Client-side components for interactivity
- Layout transitions via CSS
- Optimized re-renders with proper keys
- Lazy loading for dropdown menus

## Next Steps

1. Replace mock user data with actual auth
2. Add real navigation logic
3. Implement settings functionality
4. Add dark/light mode toggle
5. Connect to API for user profile
6. Add notification system
7. Implement search functionality

## File Structure

```
src/
├── components/
│   └── layout/
│       ├── Header.tsx
│       ├── BottomNav.tsx
│       ├── Sidebar.tsx
│       └── PageContainer.tsx
└── app/
    └── (dashboard)/
        ├── layout.tsx
        └── dashboard/
            ├── page.tsx
            ├── activities/
            │   └── page.tsx
            ├── insights/
            │   └── page.tsx
            ├── play/
            │   └── page.tsx
            └── settings/
                └── page.tsx
```

## Tailwind Configuration

Safe area support added in `tailwind.config.ts`:

```ts
padding: {
  safe: 'env(safe-area-inset-bottom)',
},
margin: {
  safe: 'env(safe-area-inset-bottom)',
},
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+
- PWA-ready

## Tips for Development

1. Test on actual mobile devices for safe area behavior
2. Use Chrome DevTools device mode for responsive testing
3. Check animations on lower-end devices
4. Verify touch targets are at least 44x44px
5. Test keyboard navigation
6. Validate color contrast ratios
7. Test with VoiceOver/TalkBack for accessibility
