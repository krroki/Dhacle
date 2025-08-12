'use client';

import { StripeButton, StripeCard, StripeTypography } from '@/components/design-system';
import theme from '../../../theme.deep.json';

export default function StyleGuidePage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-stripe sticky top-0 z-50 bg-white">
        <div className="stripe-container py-4">
          <StripeTypography variant="h2">Stripe Design System</StripeTypography>
          <StripeTypography variant="body" color="muted">
            Based on theme.deep.json tokens extracted from Stripe.com
          </StripeTypography>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-stripe bg-stripe-off-white sticky top-[88px] z-40">
        <div className="stripe-container py-3">
          <div className="flex gap-6 text-sm">
            {['Colors', 'Typography', 'Spacing', 'Buttons', 'Cards', 'Shadows', 'Gradients'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-stripe-primary hover:text-stripe-dark transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="stripe-container py-12 space-y-16">
        
        {/* Colors Section */}
        <section id="colors">
          <StripeTypography variant="h3" className="mb-6">Colors</StripeTypography>
          
          <div className="space-y-8">
            {/* Primary Colors */}
            <div>
              <StripeTypography variant="h4" className="mb-4">Primary Colors</StripeTypography>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Blue Default', value: theme.colors.primary.blue.default },
                  { name: 'Blue Hover', value: theme.colors.primary.blue.hover },
                  { name: 'Dark Blue', value: theme.colors.primary.darkBlue },
                  { name: 'Light Blue', value: theme.colors.primary.lightBlue },
                ].map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div 
                      className="h-24 rounded-lg shadow-sm"
                      style={{ backgroundColor: color.value }}
                    />
                    <StripeTypography variant="caption">{color.name}</StripeTypography>
                    <code className="text-xs text-stripe-light">{color.value}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Colors */}
            <div>
              <StripeTypography variant="h4" className="mb-4">Neutral Colors</StripeTypography>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(theme.colors.neutral.gray).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div 
                      className="h-24 rounded-lg shadow-sm border border-stripe"
                      style={{ backgroundColor: value as string }}
                    />
                    <StripeTypography variant="caption">Gray {key}</StripeTypography>
                    <code className="text-xs text-stripe-light">{value as string}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section id="typography">
          <StripeTypography variant="h3" className="mb-6">Typography</StripeTypography>
          
          <div className="space-y-8">
            {/* Font Sizes */}
            <div>
              <StripeTypography variant="h4" className="mb-4">Font Sizes</StripeTypography>
              <div className="space-y-3">
                {Object.entries(theme.typography.fontSize).map(([key, value]) => (
                  <div key={key} className="flex items-baseline gap-4">
                    <span className="text-sm font-mono text-stripe-light w-16">{key}</span>
                    <span style={{ fontSize: value as string }} className="text-stripe-dark">
                      The quick brown fox jumps over the lazy dog
                    </span>
                    <code className="text-xs text-stripe-light ml-auto">{value as string}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Font Weights */}
            <div>
              <StripeTypography variant="h4" className="mb-4">Font Weights</StripeTypography>
              <div className="space-y-3">
                {Object.entries(theme.typography.fontWeight).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm font-mono text-stripe-light w-24">{key}</span>
                    <span style={{ fontWeight: value as number }} className="text-stripe-dark text-lg">
                      The quick brown fox jumps over the lazy dog
                    </span>
                    <code className="text-xs text-stripe-light ml-auto">{value}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section id="spacing">
          <StripeTypography variant="h3" className="mb-6">Spacing</StripeTypography>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(theme.spacing).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <div 
                  className="bg-stripe-blue"
                  style={{ width: value as string, height: value as string }}
                />
                <div>
                  <StripeTypography variant="caption">spacing-{key}</StripeTypography>
                  <code className="text-xs text-stripe-light block">{value as string}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons Section */}
        <section id="buttons">
          <StripeTypography variant="h3" className="mb-6">Buttons</StripeTypography>
          
          <div className="space-y-8">
            <div>
              <StripeTypography variant="h4" className="mb-4">Button Variants</StripeTypography>
              <div className="flex gap-4 flex-wrap">
                <StripeButton variant="primary" size="sm">Small Primary</StripeButton>
                <StripeButton variant="primary" size="md">Medium Primary</StripeButton>
                <StripeButton variant="primary" size="lg">Large Primary</StripeButton>
                <StripeButton variant="secondary" size="md">Secondary Button</StripeButton>
                <StripeButton variant="primary" size="md" disabled>Disabled Button</StripeButton>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards">
          <StripeTypography variant="h3" className="mb-6">Cards</StripeTypography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
              <StripeCard key={num}>
                <StripeTypography variant="h4" className="mb-2">Card {num}</StripeTypography>
                <StripeTypography variant="body" color="muted">
                  Hover me to see the transform and shadow effects from Stripe.
                </StripeTypography>
              </StripeCard>
            ))}
          </div>
        </section>

        {/* Shadows Section */}
        <section id="shadows">
          <StripeTypography variant="h3" className="mb-6">Shadows</StripeTypography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div 
                className="h-32 bg-white rounded-lg flex items-center justify-center"
                style={{ boxShadow: theme.effects.shadows.dropdown }}
              >
                <StripeTypography variant="caption">Dropdown Shadow</StripeTypography>
              </div>
            </div>
            
            <div className="space-y-2">
              <div 
                className="h-32 bg-white rounded-lg flex items-center justify-center"
                style={{ boxShadow: theme.effects.shadows.large }}
              >
                <StripeTypography variant="caption">Large Shadow</StripeTypography>
              </div>
            </div>
          </div>
        </section>

        {/* Gradients Section */}
        <section id="gradients">
          <StripeTypography variant="h3" className="mb-6">Gradients</StripeTypography>
          
          <div className="space-y-4">
            {Object.entries(theme.gradients).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div 
                  className="h-32 rounded-lg"
                  style={{ background: value }}
                />
                <StripeTypography variant="caption">{key} Gradient</StripeTypography>
                <code className="text-xs text-stripe-light">{value}</code>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}