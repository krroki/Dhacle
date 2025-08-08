'use client';

import React from 'react';
import {
  StripeButton,
  StripeCard,
  StripeTypography,
  StripeGradient,
  StripeInput,
  StripeTextarea,
} from '@/components/design-system';

export default function DesignSystemShowcase() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Gradient */}
      <StripeGradient variant="stripe" intensity="light" className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <StripeTypography variant="h1" color="dark" className="text-center mb-4">
            Stripe Design System
          </StripeTypography>
          <StripeTypography variant="body" color="light" className="text-center max-w-2xl mx-auto">
            A comprehensive component library built with theme.deep.json tokens. Every value is tokenized for consistency and maintainability.
          </StripeTypography>
        </div>
      </StripeGradient>

      <div className="max-w-7xl mx-auto px-8 py-16 space-y-20">
        {/* Typography Section */}
        <section>
          <StripeTypography variant="h2" color="dark" className="mb-8">
            Typography System
          </StripeTypography>
          <StripeCard padding="lg">
            <div className="space-y-4">
              <StripeTypography variant="h1" color="dark">
                Heading 1 - Bold and Impactful
              </StripeTypography>
              <StripeTypography variant="h2" color="dark">
                Heading 2 - Section Headers
              </StripeTypography>
              <StripeTypography variant="h3" color="dark">
                Heading 3 - Subsection Headers
              </StripeTypography>
              <StripeTypography variant="h4" color="dark">
                Heading 4 - Card Titles
              </StripeTypography>
              <StripeTypography variant="body" color="primary">
                Body text with proper line height and spacing for optimal readability. This is the standard paragraph style used throughout the application.
              </StripeTypography>
              <StripeTypography variant="caption" color="muted">
                Caption text for supplementary information and metadata
              </StripeTypography>
              <StripeTypography variant="code" color="primary">
                const code = &ldquo;Monospace font for code snippets&rdquo;;
              </StripeTypography>
            </div>
          </StripeCard>
        </section>

        {/* Button Section */}
        <section>
          <StripeTypography variant="h2" color="dark" className="mb-8">
            Button Components
          </StripeTypography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StripeCard>
              <StripeTypography variant="h4" color="dark" className="mb-4">
                Button Variants
              </StripeTypography>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <StripeButton variant="primary">Primary Button</StripeButton>
                  <StripeButton variant="secondary">Secondary</StripeButton>
                  <StripeButton variant="ghost">Ghost</StripeButton>
                  <StripeButton variant="gradient">Gradient</StripeButton>
                </div>
              </div>
            </StripeCard>

            <StripeCard>
              <StripeTypography variant="h4" color="dark" className="mb-4">
                Button Sizes & States
              </StripeTypography>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <StripeButton size="sm">Small</StripeButton>
                  <StripeButton size="md">Medium</StripeButton>
                  <StripeButton size="lg">Large</StripeButton>
                </div>
                <div className="flex flex-wrap gap-3">
                  <StripeButton loading>Loading</StripeButton>
                  <StripeButton disabled>Disabled</StripeButton>
                </div>
              </div>
            </StripeCard>
          </div>
        </section>

        {/* Card Section */}
        <section>
          <StripeTypography variant="h2" color="dark" className="mb-8">
            Card Components
          </StripeTypography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StripeCard elevation="sm" padding="sm">
              <StripeTypography variant="h4" color="dark" className="mb-2">
                Small Elevation
              </StripeTypography>
              <StripeTypography variant="body" color="light">
                Minimal shadow for subtle depth. Perfect for list items and small components.
              </StripeTypography>
            </StripeCard>

            <StripeCard elevation="md" variant="bordered">
              <StripeTypography variant="h4" color="dark" className="mb-2">
                Bordered Card
              </StripeTypography>
              <StripeTypography variant="body" color="light">
                Clean border style with medium elevation. Great for content sections.
              </StripeTypography>
            </StripeCard>

            <StripeCard elevation="lg" variant="elevated">
              <StripeTypography variant="h4" color="dark" className="mb-2">
                Elevated Card
              </StripeTypography>
              <StripeTypography variant="body" color="light">
                Strong elevation for emphasis. Use for featured content and CTAs.
              </StripeTypography>
            </StripeCard>
          </div>

          <div className="mt-6">
            <StripeCard variant="gradient" gradientType="primary" padding="lg">
              <StripeTypography variant="h3" color="inverse" className="mb-4">
                Gradient Card
              </StripeTypography>
              <StripeTypography variant="body" color="inverse">
                Beautiful gradient backgrounds for hero sections and special announcements. All gradients use tokens from theme.deep.json.
              </StripeTypography>
              <div className="mt-6">
                <StripeButton variant="secondary">Learn More</StripeButton>
              </div>
            </StripeCard>
          </div>
        </section>

        {/* Form Section */}
        <section>
          <StripeTypography variant="h2" color="dark" className="mb-8">
            Form Components
          </StripeTypography>
          <StripeCard padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <StripeTypography variant="h4" color="dark">
                  Input Variants
                </StripeTypography>
                
                <StripeInput
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />

                <StripeInput
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hint="Must be at least 8 characters"
                  fullWidth
                />

                <StripeInput
                  label="Error State"
                  placeholder="Invalid input"
                  error="This field is required"
                  fullWidth
                />

                <StripeInput
                  label="Success State"
                  placeholder="Valid input"
                  success
                  fullWidth
                />
              </div>

              <div className="space-y-6">
                <StripeTypography variant="h4" color="dark">
                  Input Styles
                </StripeTypography>

                <StripeInput
                  label="Outlined Input"
                  variant="outlined"
                  placeholder="Outlined style"
                  fullWidth
                />

                <StripeInput
                  label="Filled Input"
                  variant="filled"
                  placeholder="Filled style"
                  fullWidth
                />

                <StripeInput
                  label="Ghost Input"
                  variant="ghost"
                  placeholder="Ghost style"
                  fullWidth
                />

                <StripeTextarea
                  label="Message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  hint="Maximum 500 characters"
                  fullWidth
                />
              </div>
            </div>
          </StripeCard>
        </section>

        {/* Gradient Showcase */}
        <section>
          <StripeTypography variant="h2" color="dark" className="mb-8">
            Gradient Backgrounds
          </StripeTypography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StripeGradient variant="primary" className="p-8 rounded-xl">
              <StripeTypography variant="h3" color="inverse">
                Primary Gradient
              </StripeTypography>
              <StripeTypography variant="body" color="inverse" className="mt-2">
                Dynamic gradient with animation support
              </StripeTypography>
            </StripeGradient>

            <StripeGradient variant="stripe" className="p-8 rounded-xl">
              <StripeTypography variant="h3" color="inverse">
                Stripe Gradient
              </StripeTypography>
              <StripeTypography variant="body" color="inverse" className="mt-2">
                Signature Stripe brand gradient
              </StripeTypography>
            </StripeGradient>
          </div>
        </section>

        {/* Complete Example */}
        <section>
          <StripeTypography variant="h2" color="dark" className="mb-8">
            Complete Example
          </StripeTypography>
          <StripeGradient variant="hero" intensity="light" className="rounded-2xl p-1">
            <StripeCard variant="default" padding="lg" className="bg-white/95 backdrop-blur">
              <div className="text-center space-y-6">
                <StripeTypography variant="h2" color="dark">
                  Start Building Today
                </StripeTypography>
                <StripeTypography variant="body" color="light" className="max-w-2xl mx-auto">
                  Join thousands of developers using our Stripe-inspired design system. Every component is built with tokens from theme.deep.json for perfect consistency.
                </StripeTypography>
                <div className="flex justify-center gap-4 pt-4">
                  <StripeButton variant="gradient" size="lg">
                    Get Started
                  </StripeButton>
                  <StripeButton variant="ghost" size="lg">
                    View Documentation
                  </StripeButton>
                </div>
              </div>
            </StripeCard>
          </StripeGradient>
        </section>
      </div>
    </div>
  );
}