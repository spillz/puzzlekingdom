export default {
    resolve: {
        preserveSymlinks: true
    },
    // optimizeDeps: {
    //     include: ['eskv']
    // },
    rollupOptions: {
        external: []
    },
    logLevel: 'info',
    plugins: [
      // logTransformedModules(),
      // visualizer({
      //   open: true,
      //   filename: 'bundle-analysis.html',
      //   gzipSize: true,
      //   brotliSize: true,
      // })
    ],
    esbuild: {
        pure: ['console.log'],    // example: have esbuild remove any console.log
        minifyIdentifiers: false, // but keep variable names
    },
    base: './',
    build: {
      outDir: '../spillz.github.io/island-chains',
      target: 'es2020', //es2019
      minify: false,
    }
};