export const phoneRegex = /^(([0-9]){10})$/;
export const nameRegex = /^[0-9a-zA-Z. \\-]+$/;

export function phone(value: string): boolean {
  return phoneRegex.test(value);
}

export function name(value: string): boolean {
  return nameRegex.test(value);
}
