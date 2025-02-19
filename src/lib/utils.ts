export const cn = (...inputs: string[]) => {
  return inputs.filter(Boolean).join(' ')
}

export const sanitizeString = (str: string): string => {
  return str.replace(/</g, "<").replace(/>/g, ">");
};
