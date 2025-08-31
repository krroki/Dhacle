// Modern React Pattern: Hybrid Footer Component  
// Server Component (static parts) + Client Component (interactive parts)

import { FooterLayout } from './FooterLayout';
import { FooterClient } from './FooterClient';

export function Footer() {
  return (
    <FooterLayout>
      <FooterClient />
    </FooterLayout>
  );
}