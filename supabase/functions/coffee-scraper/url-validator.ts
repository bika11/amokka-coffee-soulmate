
export function isValidAmokkaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'amokka.com' && 
           urlObj.pathname.includes('/products/');
  } catch {
    return false;
  }
}
