import axios from 'axios';
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

class Api {
  url = (isDev ? 'http://localhost:8080' : '') + `/api/`;
  async get(url: string, opt?: any) {
    const res = await axios.get(this.url + url.replace(/^\/+/g, ''), opt);
    return res.data;
  }
  async post(url: string, body?: any, config?: any) {
    const res = await axios.post(
      this.url + url.replace(/^\/+/g, ''),
      body,
      config
    );
    return res.data;
  }
}

export default new Api();
