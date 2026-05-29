import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  // Force HTTPS for 1 year, include subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stop MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer policy
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Force HTTPS — redirect any http:// request to https://
      {
        source: '/(.*)',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://ferudin.uz/:path*',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
