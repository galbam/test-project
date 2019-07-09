const express = require("express");
const router = express.Router();
const axios = require("axios");
var fs = require("fs");

const Countries = require("./CountryHandler.js");

router.get("/countries", async (req, res) => {
  const countriesObj = new Countries();
  const countriesArr = await countriesObj.getCountries();

  res.json(countriesArr);
});

module.exports = router;
