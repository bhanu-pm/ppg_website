
export interface JsonMessage {
  id: string;
  code: string;
  message: string;
  timestamp: Date;
  severity?: 'info' | 'warning' | 'error' | 'success';
  metadata?: Record<string, any>;
}

export interface TimeFrame {
  label: string;
  value: string;
  hours: number;
}
