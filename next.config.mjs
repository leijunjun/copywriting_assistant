import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    BUILD_ENV: process.env.BUILD_ENV || 'test',
    buildTime: new Date().toLocaleString()
  },
  // Vercel优化配置
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', '@radix-ui/react-icons'],
    // 减少 webpack 缓存错误
    webpackBuildWorker: true,
    // 优化启动性能
    serverComponentsExternalPackages: ['sharp'],
  },
  // 减少 webpack 缓存问题
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 开发环境下禁用某些缓存
      config.cache = false;
    }
    
    // 修复 mini-css-extract-plugin 错误
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    // 处理 react-filerobot-image-editor 的模块解析问题
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    // 添加对特定模块的处理 - 简化版本
    config.module.rules.push({
      test: /node_modules\/react-filerobot-image-editor/,
      type: 'javascript/auto',
    });
    
    // 处理模块解析问题
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    
    // 强制替换 react-konva 版本
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-konva': 'react-konva',
    };
    
    // 禁用某些优化以避免构建错误
    config.optimization = {
      ...config.optimization,
      splitChunks: false,
    };
    
    return config;
  },
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 压缩配置
  compress: true,
  // 构建优化
  swcMinify: true,
  // 输出配置
  output: 'standalone',
  // 头部优化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600'
          }
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600'
          }
        ],
      }
    ];
  },
  // 重写规则
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health'
      }
    ];
  }
};

export default withNextIntl(nextConfig);
