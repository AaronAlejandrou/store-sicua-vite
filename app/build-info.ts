// Deployment timestamp to force rebuild
export const BUILD_INFO = {
  timestamp: '2025-07-28T02:00:00.000Z', // Force new build
  version: '1.0.2', // Bump version
  buildId: Math.random().toString(36).substring(2, 15)
};

console.log('🚀 NEW BUILD DEPLOYED:', BUILD_INFO.timestamp);
console.log('🆔 Build ID:', BUILD_INFO.buildId);
