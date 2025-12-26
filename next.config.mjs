/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization - automatically optimizes images for better performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize images for better performance
    unoptimized: false,
  },
  
  // Compression - gzip compression for better load times
  compress: true,
  
  // React strict mode - helps catch bugs and improve performance
  reactStrictMode: true,
  
  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Optimize bundle size - SWC minification is enabled by default in Next.js 15
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
};

export default nextConfig;
