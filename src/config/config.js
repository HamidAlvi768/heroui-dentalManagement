import axios from 'axios';

const config = {
  appName: 'Al Shifa',
  // baseURL: 'http://192.168.18.53/jantrah/dentaldoc/api',
  baseURL: 'https://leightonbuzzardairportcabs.co.uk/dental/api',

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