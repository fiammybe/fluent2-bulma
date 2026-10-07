import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const minify = mode === 'minify';
  const overview = mode === 'overview';
  return {
    base: './',
    logLevel: 'warn',
    build: {
      outDir: overview ? 'dist' : 'css',
      emptyOutDir: overview,
      cssMinify: minify,
      minify: false,
      rollupOptions: {
        input: overview ? 'overview.html' : 'sass/index.scss',
        output: {
          assetFileNames: overview
            ? undefined
            : (assetInfo) => {
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
