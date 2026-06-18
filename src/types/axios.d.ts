import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean
    skipAuthLogout?: boolean
  }
}
