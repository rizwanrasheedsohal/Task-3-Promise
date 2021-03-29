const fetch = require("node-fetch");
const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const isAbsoluteUrl = require("is-absolute-url");
var urlExists = require("url-exists");

exports.scrap = function (req, res) {
  const addressArray = req.query.address;
  const promises = [];
  const wrongAddreses = [];
  const titles = [];
  for (let address of addressArray) {
    if (!isAbsoluteUrl(address)) {
      address = "https://" + address;

      urlExists(address, function (err, exists) {
        if (exists) {
          promises.push(got(address));
        } else {
          wrongAddreses.push(address);
        }
      });
      // return res.send("Invalid URL");
    } else {
      promises.push(got(address));
    }
  }

  Promise.all(promises)
    .then((responses) => {
      for (const response of responses) {
        let dom = new JSDOM(response.body);
        let title = dom.window.document.querySelector("title").textContent;
        titles.push(title);
        console.log(title);
      }
      res.render("titles", { titles, wrong: wrongAddreses });
      // res.send(titles);
    })
    .catch((err) => {
      console.error("fetch failed", err);
      res.send("Error");
    });
};
