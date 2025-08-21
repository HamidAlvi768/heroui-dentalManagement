import axios from 'axios';

const config = {
  // appName: 'JDent Lite',
  baseURL: 'http://localhost/jantrah/dentaldoc/api',
  // baseURL: 'https://cafpavia.com/dental-lite/backend/api',

  initAPI(token = null) {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  },

  getData(endpoint) {
    return this.api.get(endpoint);
  },

  postData(endpoint, data) {
    return this.api.post(endpoint, data);
  }

}

export default config;