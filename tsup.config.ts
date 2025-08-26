import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    creator: 'src/creator.ts',
  },
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es2020',
  globalName: 'keybuddy',
  outDir: 'dist',
  banner: {
    js: '/* keybuddy - Modern keyboard shortcuts library */',
  },
  esbuildOptions(options) {
    // Remove console and debugger statements in production builds
    options.drop =
      process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [];
    options.treeShaking = true;
    options.pure = ['console.debug', 'console.log'];
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production',
    ),
  },
});
