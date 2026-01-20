// Augment the NodeJS ProcessEnv interface to include API_KEY
// This avoids redeclaring the global 'process' variable which causes conflicts
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
