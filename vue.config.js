module.exports = {
  publicPath: '/wheremask/',
  configureWebpack: {
    devtool: 'source-map',
  },
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: process.env.NODE_ENV === 'production' ? 'build/path/index.html'
        : 'index.html', // 开发环境需要填index.html才能找到路径
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },
  },
};
