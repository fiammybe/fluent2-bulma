import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const minify = mode === 'minify';
  return {
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
  };
});
