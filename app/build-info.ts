// Deployment timestamp to force rebuild
export const BUILD_INFO = {
  timestamp: new Date().toISOString(),
  version: '1.0.1'
};

console.log('App built at:', BUILD_INFO.timestamp);
