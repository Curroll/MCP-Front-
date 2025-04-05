import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // adjust path if needed
  withCredentials: true, // use this if you're using cookies
});

export default api;
