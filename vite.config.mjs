import { defineConfig } from 'vite';

const minify = process.env.MINIFY === 'true';

export default defineConfig({
  logLevel: 'warn',
  build: {
    outDir: 'css',
    emptyOutDir: false,
    cssMinify: minify,
    minify: false,
    rollupOptions: {
      input: 'sass/index.scss',
      output: {
        assetFileNames: minify ? 'fluent2-bulma.min.css' : 'fluent2-bulma.css',
      },
    },
  },
  css: {
    preprocessorOptions: { scss: { loadPaths: ['node_modules'] } },
  },
});
