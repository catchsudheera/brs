const encryptPassword = (text: string): string => {
  return btoa(text);
};

const decryptPassword = (encoded: string): string => {
  return atob(encoded);
};

export const EDIT_SCORES_PASSWORD = 'TGV0TWVJbkAxMjM=';

export const validateEditPassword = (password: string): boolean => {
  return password === decryptPassword(EDIT_SCORES_PASSWORD);
}; 