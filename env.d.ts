/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SOME_IP: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
