declare module "aes256" {
  const aes256: {
    encrypt(key: string, text: string): string;
    decrypt(key: string, encrypted: string): string;
  };
  export = aes256;
}
