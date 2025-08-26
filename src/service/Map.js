// src/service/Map.js
import { useState, useEffect } from "react";
import axios from "axios";

const useConnectionMap = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  const fetchMaps = async (url = null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        url || `${import.meta.env.VITE_SERVER_URL}applications/connections/`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      setMaps(data.results || []);
      setPagination({
        count: data.count || data.results?.length || 0,
        next: data.next || null,
        previous: data.previous || null,
        currentPage: url
          ? url.includes("page=")
            ? parseInt(url.match(/page=(\d+)/)?.[1])
            : 1
          : 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error fetching connection maps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return {
    maps,
    loading,
    error,
    pagination,
    refresh: () => fetchMaps(),
    fetchPage: (url) => fetchMaps(url),
  };
};

export default useConnectionMap;
