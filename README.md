# Dhacle Frontend - 쇼츠 스튜디오

AI Creator Hub for YouTube Shorts creators with Stripe-inspired design system.

## 🎯 Task R-1.2 Completion Status

✅ **COMPLETED** - Style Guide with Stripe Design Tokens

### What was accomplished:
1. ✅ Updated `tailwind.config.ts` to reference `theme.deep.json` tokens
2. ✅ Created `/style-guide` page component with full design system visualization
3. ✅ Implemented all design sections (colors, typography, spacing, buttons, cards, shadows, gradients)
4. ✅ Added interactive hover effects matching Stripe.com patterns
5. ✅ Successfully built for production

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📄 Key Pages

- **`/`** - Homepage with hero, features, testimonials
- **`/style-guide`** - 🆕 Complete Stripe design system showcase
- **`/tools`** - Creator tools hub
- **`/tools/transcribe`** - AI subtitle generator
- **`/supabase-test`** - Database connection test

## 🎨 Design System (theme.deep.json)

The design system is extracted from Stripe.com and includes:

### Colors
- Primary blues with hover/active states
- Neutral gray scale (50-900)
- Text colors (primary, inverse)
- Button color schemes

### Typography
- Font families (sohne-var, monospace)
- Font sizes (xs to 5xl)
- Font weights (300-700)
- Line heights and letter spacing

### Effects
- Shadows (dropdown, card, button, large)
- Transitions with easing functions
- Transform effects (scale, translateY)
- Opacity levels

### Components
- Interactive buttons with hover states
- Cards with elevation on hover
- Gradients (hero, primary, stripe)
- Border radius system

## 🏗️ Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── style-guide/  # 🆕 Design system showcase
│   ├── tools/        # Creator tools
│   └── auth/         # Authentication routes
├── components/       # React components
│   ├── ui/          # Base UI components
│   ├── sections/    # Page sections
│   └── layout/      # Layout components
├── lib/             # Utilities and configurations
│   └── supabase/    # Supabase client setup
└── theme.deep.json  # 🆕 Stripe design tokens
```

## 🚢 Deployment

Ready for Vercel deployment:

1. Push to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

The `vercel.json` configuration is included for seamless deployment.

## 📊 Build Status

```
Route (app)                    Size     First Load JS
├ ○ /                         2.86 kB   103 kB
├ ○ /style-guide             2.6 kB    102 kB  ✨
├ ○ /tools                   162 B     103 kB
└ ○ /tools/transcribe       12.8 kB   155 kB
```

Build completed successfully with only ESLint warnings.
