const _ = require("lodash");

_.templateSettings.interpolate = /\{\{([\s\S]+?)\}\}/g;

module.exports = _.template;
