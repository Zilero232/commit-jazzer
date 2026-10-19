export type Level = 'error' | 'info' | 'success' | 'warn';

export type LogInput = {
  level: Level;
  message: string;
};
