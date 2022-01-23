"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = {
    RemixDevtools: function () {
      return null;
    },
  };
} else {
  module.exports = require("./dist");
}
