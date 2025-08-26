// src/service/Logs.js
import { useState, useEffect } from "react";
import axios from "axios";

const useAgentLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  const fetchAgentLogs = async (url = null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        url || `${import.meta.env.VITE_SERVER_URL}logs/agent-logs/`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      setLogs(data.results || []);
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
      console.error("Error fetching agent logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    pagination,
    refresh: () => fetchAgentLogs(),
    fetchPage: (url) => fetchAgentLogs(url),
  };
};

export default useAgentLogs;
