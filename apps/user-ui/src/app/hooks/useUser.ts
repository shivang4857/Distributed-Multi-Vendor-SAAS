import {useQuery} from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';


//fetch user data from the api
const fetchUser = async () => {
  const response = await axiosInstance.get('/logged-in-user', { withCredentials: true });
  return response.data;
};

//custom hook to get user data
 const useUser = () => {
    const { data, error, isLoading, refetch } = useQuery({
      queryKey: ['logged-in-user'],
      queryFn: fetchUser,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Retry once on failure
    });

    return {
      user: data?.user,
      isLoading,
      isError: !!error,
      refetchUser: refetch,
    };
}

export default useUser;
