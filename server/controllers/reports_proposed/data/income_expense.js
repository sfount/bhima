var q       = require('q');
var db      = require('../../../lib/db');
var numeral = require('numeral');

exports.compile = function (options) { 
  'use strict';

  return q.resolve({value : 5});
};

