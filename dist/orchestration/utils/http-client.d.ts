import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
export declare const httpClient: axios.AxiosInstance;
export declare function httpGet<T = any>(url: string, config?: AxiosRequestConfig, retries?: number): Promise<AxiosResponse<T>>;
export declare function httpPost<T = any>(url: string, data: any, config?: AxiosRequestConfig, retries?: number): Promise<AxiosResponse<T>>;
