import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const minify = mode === 'minify';
  const overview = mode === 'overview';
  const library = mode === 'library';
  return {
    base: './',
    logLevel: 'warn',
    build: {
      outDir: overview ? 'dist' : library ? 'js' : 'css',
      emptyOutDir: overview || library,
      cssMinify: minify,
      minify: false,
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
        input: overview ? 'overview.html' : library ? 'src/js/index.js' : 'sass/index.scss',
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
