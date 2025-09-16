export interface ApiResponseSuccess<T = any> {
  data: T;
  message?: string;
  success: true;
}

export interface ApiResponseFailure {
  data: undefined;
  message?: string;
  success: false;
}

export type ControllerResult<T = any> = T | { data?: T; message?: string; success?: boolean };
