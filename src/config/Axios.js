import axios from "axios";
import { BASE_URL } from "../constants";

const Axios = axios.create({
  baseURL: BASE_URL,
  timeout: 8000
});

export default Axios;