import type { AppDispatch } from '../redux/store';
import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { baseURL } from '../config/apiConfig.ts';
// import { logout, updateAuthInfo, AuthTokensPayload } from '../redux/slices/authSlice.ts';
import { logout, updateAuthInfo, type AuthTokensPayload } from '@/redux/slices/authSlice.ts';
import { setLocalStorage } from '@/lib/helpers.ts';
import type { NavigateFunction } from 'react-router-dom';
import { notify } from '@/components/ui/notify.tsx';


interface ErrorConfig extends AxiosRequestConfig {
    _retry: boolean;
}
interface Token {
    ati: string;
    exp: number;
    id: string;
}

const refreshTokenExceptions = new Set(['/login', '/auth/refresh-token']);

export const parseJWT = (token: string) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        const base64Url = parts[1];
        const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + (c.codePointAt(0) ?? 0).toString(16)).slice(-2);
                })
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.log('Error occurred while parsing token.', e);
        return null;
    }
};
export const isTokenExpired = (token: Token) => {
    if (!token?.exp) return true;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return token.exp < currentTimestamp;
};

class ApiClient {
    private readonly client: AxiosInstance;
    private token: string | undefined;
    private refreshToken: string | undefined;
    private dispatch: AppDispatch | undefined;
    private navigate: NavigateFunction | undefined;
    private refreshPromise: Promise<AxiosResponse<{ accessToken: string; refreshToken: string }>> | null = null;
    private isLoggingOut: boolean = false;

    constructor(baseURL: string, headers?: Record<string, string>) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        });
        this.handleRequest = this.handleRequest.bind(this);
        this.handleRequestError = this.handleRequestError.bind(this);
        this.handleSuccessResponse = this.handleSuccessResponse.bind(this);
        this.handleErrorResponse = this.handleErrorResponse.bind(this);
        this.refreshAccessToken = this.refreshAccessToken.bind(this);
        this.setDispatch = this.setDispatch.bind(this);
        this.clearTokens = this.clearTokens.bind(this);

          this.client.interceptors.request.use(this.handleRequest, this.handleRequestError);
        this.client.interceptors.response.use(this.handleSuccessResponse, this.handleErrorResponse);
    }

    clearTokens() {
        this.token = undefined;
        this.refreshToken = undefined;
        this.isLoggingOut = false;
        localStorage.removeItem('token');
        localStorage.removeItem('userAttempts');
    }

    private handleRequest(config: InternalAxiosRequestConfig) {
        if (this?.token) {
            // Set token in the Authorization header
            config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
    }
    private handleRequestError(error: Error) {
        return Promise.reject(error);
    }

    private handleSuccessResponse(response: AxiosResponse) {
        // You can customize the success response handling here
        return response;
    }

    // Set the token dynamically
    setToken(token: string | undefined, refreshToken?: string | undefined) {
        this.token = token ?? this.token;
        this.refreshToken = refreshToken ?? this.refreshToken;
    }
    
    private async handleErrorResponse(error: AxiosError) {
        if (error?.response) {
            const originalRequest = error.config as ErrorConfig;
            const { Authorization } = originalRequest?.headers || {};
            if (
                Authorization &&
                error.response.status === 401 &&
                !originalRequest._retry &&
                !refreshTokenExceptions.has(originalRequest.url || '')
            ) {
                originalRequest._retry = true;
                const res = await this.refreshAccessToken();
                if (!res) {
                    throw error;
                }
                this.client.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
                return this.client.request(originalRequest);
            }
            if (error?.response?.status === 423) {
                console.log('🚀 ~ ApiClient ~ handleErrorResponse ~ error?.response?.status:', error?.response?.status);
                this.clearTokens();
                this.navigate?.('/sign-in');
            }
            throw error;
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request made but no response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up the request:', error.message);
        }

        // You can throw a custom error or handle it as needed
        throw error;
    }

    private ensureRefreshPromise() {
        if (!this.refreshPromise) {
            this.token = undefined;
            this.refreshPromise = this.client.post<{ accessToken: string; refreshToken: string }>(
                `${baseURL}/auth/refresh-token`,
                { refreshToken: this.refreshToken }
            );
        }
        return this.refreshPromise;
    }

    private applyTokens(data: AuthTokensPayload) {
        this.dispatch?.(updateAuthInfo(data));
        setLocalStorage('token', data);
        this.setToken(data.accessToken, data.refreshToken);
    }

    private handleRefreshFailure(error: Error): never {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = (error.response?.data as { message?: string } | undefined)?.message;
            const isSessionExpired = status === 401 || message === 'Invalid refresh token';
            // Always suppress downstream toasts for refresh-token failures — we handle messaging here.
            if (error.config?.headers) {
                error.config.headers['hideToast'] = true;
            }
            if (isSessionExpired && !this.isLoggingOut) {
                this.isLoggingOut = true;
                notify('Session expired, Please login!','warning');
                this.dispatch?.(logout(this.navigate, true));
            }
        }
        throw error;
    }

    private async refreshAccessToken() {
        try {
            const res = await this.ensureRefreshPromise();
            this.applyTokens(res.data);
            return res;
        } catch (e) {
            this.handleRefreshFailure(e as Error);
        } finally {
            this.refreshPromise = null;
        }
    }

    setDispatch(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }
    setNavigate(navigate: NavigateFunction) {
        this.navigate = navigate;
    }
    // Example GET request
    async get(endpoint: string, options?: AxiosRequestConfig) {
        return this.client.get(endpoint, options);

    }

    // Example POST request
    async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<AxiosResponse<T>> {
        return this.client.post(endpoint, data, { headers });
    }


    // Add more methods for different HTTP methods as needed
    async delete(endpoint: string, options?: AxiosRequestConfig) {
        return this.client.delete(endpoint, options);
    }

    async put(endpoint: string, data?: unknown, headers?: Record<string, string>) {
        return this.client.put(endpoint, data, { headers });
    }
    // Example PATCH request
    async patch(endpoint: string, data?: string, headers?: Record<string, string>) {
        return this.client.patch(endpoint, data, { headers });
    }
}

const client = new ApiClient(baseURL);

export default client;
