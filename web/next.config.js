/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better dev experience
  reactStrictMode: true,
  
  // Optimize for production
  poweredByHeader: false,
  
  // Image optimization - add domains if needed
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // Redirect legacy URLs if needed
  async redirects() {
    return [
      {
        source: '/report/:shortCode',
        destination: '/share/:shortCode',
        permanent: true,
      },
    ];
  },
  
  // Security headers handled in vercel.json, but fallback here
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
