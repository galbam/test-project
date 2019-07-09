const axios = require("axios");

class CountryHandler {
  constructor() {
    this.url = "https://restcountries.eu/rest/v2/";
  }

  async getCountries() {
    try {
      let response = await axios.get(this.url);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = CountryHandler;
