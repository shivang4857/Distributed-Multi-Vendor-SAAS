import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '').endsWith('/api')
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
      : `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/api`
    : 'http://localhost:8080/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
  //handle logout and prevent  infinite loops

  const handleLogout = () => {
   if(window.location.pathname !== '/login'){
    window.location.href = '/login';
   }                                                                    
    console.log("Logging out user due to unauthorized access.");
  };

  // handle added a new token to the queued users

  const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
  }

  //execute all the queued requests after getting new token

  const onRefreshed = (token: string) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
  };


  //handle api reuests 
    axiosInstance.interceptors.response.use(
   ( config)  => config , 
    (error )=> Promise.reject(error)
  );

  //handle expired tokens and refresh logic 
    axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axiosInstance.post('/refresh-token-user', {}, { withCredentials: true });
          const newToken = response.data.token;

          axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          onRefreshed(newToken);
          return axiosInstance(originalRequest);
        } catch (err) {
          handleLogout();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
export default axiosInstance;
