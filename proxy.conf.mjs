export default {
  '/api': {
    target: 'https://interviews.bigvu.tv',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '' 
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('Authorization', 'Basic YmlndnU6aW50ZXJ2aWV3');
    }
  }
};