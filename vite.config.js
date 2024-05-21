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
    base: './',
    build: {
      target: 'es2022', //es2019
      minify: true,
    }
};