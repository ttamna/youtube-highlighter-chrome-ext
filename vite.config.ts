export default {
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        content: 'src/content.ts',
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
};
