export default async function globalSetup() {
  if (process.platform === 'darwin') {
    process.env.MONGOMS_VERSION = '7.0.14';
  }
}
