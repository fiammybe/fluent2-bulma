import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const minify = mode === 'minify';
  const overview = mode === 'overview';
  const library = mode === 'library';
  const demo = mode === 'demo';
  return {
    ...(demo ? { root: 'demo' } : {}),
    base: './',
    logLevel: 'warn',
    build: {
      outDir: overview || demo ? (demo ? '../dist/demo' : 'dist') : library ? 'js' : 'css',
      emptyOutDir: overview || library,
      cssMinify: minify,
      minify: library ? 'oxc' : false,
      ...(library
        ? {
            lib: {
              entry: 'src/js/index.js',
              formats: ['es'],
              fileName: 'fluent2',
            },
          }
        : {}),
      rollupOptions: {
        input: demo
          ? {
              home: 'index.html',
              login: 'login.html',
              dashboard: 'dashboard.html',
              blog: 'blog.html',
              forum: 'forum.html',
              thread: 'thread.html',
              profile: 'profile.html',
              store: 'store.html',
            }
          : overview
            ? 'overview.html'
            : library
              ? 'src/js/index.js'
              : 'sass/index.scss',
        output: {
          assetFileNames: (assetInfo) => {
            if (overview) {
              return 'assets/[name]-[hash][extname]';
            }

            if (library) return '[name][extname]';

            if (assetInfo.name?.endsWith('.woff2')) {
              return 'fonts/[name][extname]';
            }

            return minify ? 'fluent2-bulma.min.css' : 'fluent2-bulma.css';
          },
        },
      },
    },
    css: {
      preprocessorOptions: { scss: { loadPaths: ['node_modules'] } },
    },
  };
});
