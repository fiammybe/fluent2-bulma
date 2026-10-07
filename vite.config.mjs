import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const minify = mode === 'minify';
  return {
    base: './',
    logLevel: 'warn',
    build: {
      outDir: 'css',
      emptyOutDir: false,
      cssMinify: minify,
      minify: false,
      rollupOptions: {
        input: 'sass/index.scss',
        output: {
          assetFileNames: (assetInfo) => {
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
