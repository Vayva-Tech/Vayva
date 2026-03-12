#!/bin/bash
set -e

APP_NAMES=("storefront" "marketplace" "ops-console")

for APP in "${APP_NAMES[@]}"; do
  echo "🚀 Scaffolding apps/$APP..."
  mkdir -p "apps/$APP/src/app" "apps/$APP/public"
  
  # 1. package.json
  cat > "apps/$APP/package.json" <<EOF
{
  "name": "$APP",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p $([ "$APP" == "storefront" ] && echo 3001 || ([ "$APP" == "marketplace" ] && echo 3002 || echo 3003))",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@vayva/ui": "workspace:*",
    "@vayva/theme": "workspace:*",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.3.0"
  }
}
EOF

  # 2. tsconfig.json
  cat > "apps/$APP/tsconfig.json" <<EOF
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

  # 3. next.config.js
  cat > "apps/$APP/next.config.js" <<EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@vayva/ui", "@vayva/theme"],
};
module.exports = nextConfig;
EOF

  # 4. postcss.config.js
  cat > "apps/$APP/postcss.config.js" <<EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

  # 5. tailwind.config.js (Linking to Theme)
  cat > "apps/$APP/tailwind.config.ts" <<EOF
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
      },
    },
  },
  plugins: [],
};
export default config;
EOF

  # 6. src/app/layout.tsx
  cat > "apps/$APP/src/app/layout.tsx" <<EOF
import '@vayva/theme/css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vayva $APP',
  description: 'Vayva',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF

  # 7. src/app/globals.css
  cat > "apps/$APP/src/app/globals.css" <<EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

done

# Specific Page Content
# Storefront
cat > "apps/storefront/src/app/page.tsx" <<EOF
import { Button, StorefrontShell, GenericShell } from '@vayva/ui';

export default function Home() {
  return (
    <StorefrontShell
      header={<div className="font-bold text-xl">Vayva Storefront</div>}
      footer={<div className="text-center text-gray-500">© 2024 Vayva</div>}
    >
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Vayva Storefront</h1>
        <p className="mb-8 text-gray-600">This is a public store powered by Vayva.</p>
        <Button>Shop Now</Button>
      </div>
    </StorefrontShell>
  );
}
EOF

# Ops Console
cat > "apps/ops-console/src/app/page.tsx" <<EOF
import { Button, OpsShell } from '@vayva/ui';

export default function Home() {
  return (
    <OpsShell
      header={<span className="font-mono">OPS:MAIN</span>}
      sidebar={<div className="p-4 text-gray-400">Nav Placeholder</div>}
    >
      <h1 className="text-2xl font-bold mb-4">Internal Operations</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#222] p-4 rounded border border-[#333]">
           <div className="text-sm text-gray-400">Pending Approvals</div>
           <div className="text-2xl font-bold">12</div>
        </div>
      </div>
    </OpsShell>
  );
}
EOF

# Marketplace
cat > "apps/marketplace/src/app/page.tsx" <<EOF
import { Button, StorefrontShell } from '@vayva/ui';

export default function Home() {
  return (
    <StorefrontShell
      header={<div className="font-bold text-xl text-purple-600">Vayva Market</div>}
      footer={<div className="text-center text-gray-500">Marketplace Footer</div>}
    >
      <div className="container mx-auto py-20">
        <h1 className="text-4xl font-bold mb-4">Global Marketplace</h1>
        <Button variant="secondary">Browse Categories</Button>
      </div>
    </StorefrontShell>
  );
}
EOF

echo "✅ App scaffolding complete."
