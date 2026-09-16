module.exports = {
  framework: 'vite',
  port: 5173,
  viewports: ['mobile', 'desktop'],
  accessibility: {
    enabled: true,
    standard: 'WCAG21AA',
    ignore: []
  },
  screenshot: {
    enabled: true,
    fullPage: true,
    format: 'png'
  },
  output: {
    directory: './uisentinel-output',
    format: 'json'
  },
  routes: ['/']
};
