const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var validUrl = require("valid-url");

exports.scrap = function (req, res) {
  let addressArray = req.query.address;
  //If there is only one address,then make an array
  if (!Array.isArray(addressArray)) {
    addressArray = [addressArray];
  }

  getTiles(addressArray)
    .then((titles) => {
      res.render("titles", { titles });
    })
    .catch((err) => {
      console.log("Error");
    });
};

getTiles = (addressArray) => {
  const titles = [];
  let count = 0;
  return new Promise((resolve, reject) => {
    for (let address of addressArray) {
      if (!validUrl.isUri(address)) {
        address = "https://" + address;
      }
      getSingleTitlePromise(address)
        .then((title) => {
          count++;
          titles.push(address + " - " + "'" + title + "'");
          if (addressArray.length == count) {
            resolve(titles);
          }
        })
        .catch((err) => {
          count++;
          titles.push(address + err);
        });
    }
  });
};

getSingleTitlePromise = (address) => {
  return new Promise((resolve, reject) => {
    got(address)
      .then((response) => {
        let dom = new JSDOM(response.body);
        let title = dom.window.document.querySelector("title").textContent;
        resolve(title);
      })
      .catch((noResponse) => {
        reject(" -No Response");
      });
  });
};
