import axios from 'axios';

const config = {
  // appName: 'JDent Lite',
  // baseURL: 'http://192.168.18.112/alshifadentalbackend/dentaldoc/api',
  baseURL: 'https://dentallite.jantrah.com/backend/api',

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