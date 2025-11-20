import { useState, useEffect } from 'react';

const useApi = (apiFunction, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunction(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, []);

    return { data, loading, error, execute };
};

export default useApi;