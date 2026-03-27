module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm dev',
      startServerReadyPattern: 'ready|started|listening',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000/dashboard/nonprofit',
        'http://localhost:3000/dashboard/nightlife',
        'http://localhost:3000/dashboard/fashion',
        'http://localhost:3000/dashboard/courses',
        'http://localhost:3000/dashboard/bookings',
        'http://localhost:3000/dashboard/restaurant',
        'http://localhost:3000/dashboard/travel',
        'http://localhost:3000/dashboard/saas',
      ],
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        output: ['html', 'json'],
        outputPath: './.lighthouseci/results',
        preset: 'desktop',
        throttlingMethod: 'simulate',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 1.0 }],
        'categories:seo': ['error', { minScore: 1.0 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
