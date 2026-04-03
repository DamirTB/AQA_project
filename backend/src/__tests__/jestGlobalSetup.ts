// Pin MONGOMS_VERSION on macOS so mongodb-memory-server downloads MongoDB 7.x,
// which supports macOS 13 (Ventura). MongoDB 8.x requires macOS 14+.
// This env var reinforces the version set in package.json["mongodbMemoryServer"].
// Has no effect on Linux CI where the default binary works fine.
export default async function globalSetup() {
  if (process.platform === 'darwin') {
    process.env.MONGOMS_VERSION = '7.0.14';
  }
}
