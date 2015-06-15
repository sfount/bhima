/**
 * Mail Plugin
 *
 * Extends bhima to allow email reporting at a custom frequency.
 * Depends on later.js (http://bunkat.github.io/later/)
 *
 * PLUGIN OPTIONS
 * {
 *   name : 'mail',
 *   script : 'index.js',
 *   options : {
 *     emails : [{
 *       name : 'Daily Financial Report',
 *       frequency : 'daily',
 *       addressList : 'developers'
 *     }]
 *   }
 * ]
 */

var VERSION = '0.1.0';

// global imports
var q = require('q'),
    fs = require('fs'),
    path = require('path'),
    later = require('later');

// local imports
var render = require(path.join(__dirname, 'lib/render')),
    mailer = require(path.join(__dirname, 'lib/mailer')),
    archiver = require(path.join(__dirname, 'lib/archiver')),
    query = require(path.join(__dirname,'lib/query')),
    util = require(path.join(__dirname, 'lib/util')),
    locales = require(path.join(__dirname,'lib/locales')),
    addressBook = require(path.join(__dirname, 'addresses/list.json'));

function MailPlugin(options) {
  'use strict';

  console.log('Configuring MailPlugin ...');

  options =  options || {};

  this._running = true;
  this._timestamp = Date.now();

  // configure the emails
  this._emails = options.emails || [];
  this._timers = [];
  this._configure();
}

// interpret the cron tasks and schedule them
MailPlugin.prototype._configure = function () {
  var self = this,
      schedule;

  self._timers = self._emails.map(function (email) {

    // parse the cron task into a scheule
    schedule = later.parse.cron(email.frequency);

    // set a timer, which will
    var timer = later.setInterval(function () {
      var addresses = addressBook[email.addressList];
      addresses.forEach(function (contact) {
        self.send(email.addressList, email.name, contact, new Date());
      });
    }, schedule);

    return timer;
  });
};

// renders an email and sends it to a given contact
MailPlugin.prototype.send = function (list, email, contact, date) {
  var base = __dirname + email + '/',
      queries = require(path.join(base,  'queries.json')),
      text = require(path.join(base, 'lang', contact.language + '.json')),
      tpl = fs.readFileSync(path.join(base, 'daily.tmpl.html'), 'utf8'),
      message;

  // convert date into a database-friendly date
  var dateFrom = '\'' + date.getFullYear() + '-0' + (date.getMonth() + 1) + '-' + date.getDate() + ' 00:00:00\'',
      dateTo = '\'' + date.getFullYear() + '-0' + (date.getMonth() + 1) + '-' + (date.getDate() + 1)  + ' 00:00:00\'';

  // loop through the queries and do the following:
  // 1) template in the date fields
  // 2) execute the queries using the query() function
  // 3) upon successful execution, convert result into proper locale
  var promises = Object.keys(queries).map(function (k) {
    var dfd = q.defer(),
        template = queries[k],

        // template the sql query with correct dates
        sql = render(template, { date : { to : dateTo, from : dateFrom }});

    // execute the templated query
    query(sql)
    .then(function (rows) {

      // all queries return a single number in the `total` field
      var result = rows[0].total;

      // if the result is a currency, make sure it is in the correct locality
      // NOTE : this is NOT the email locality, it is defined by the query.
      if (template.type === 'currency') {
        template.result = locales.currency(result, template.format);
      } else {
        template.result = result;
      }

      // resolve the original query with the data formatted and
      // cached in the result property
      dfd.resolve(template);
    })
    .catch(dfd.reject)
    .done();

    return dfd.promise;
  });

  // all queries have been executed and the data is cached in the result
  // property
  q.all(promises)
  .then(function (results) {
    var data = {},
        templatedText,
        options;

    // convert promise array to a data object
    Object.keys(queries).forEach(function (key, idx) {
      data[key] = results[idx].result;
    });

    // now, we want to render the language file
    templatedText = util.recurse(text, function (node, key) {
      node[key] = render(node[key], data);
    });


    // collate data and text for email templating
    options = {
      data : data,
      text : templatedText
    };

    // render the email
    message = render(tpl, options);

    // use mailer to send the message
    return mailer(list, contact, message, date);
  })
  .then(function () {

    // after message is sent, archive a copy in /archive
    archiver(list + '-' + contact.name, message, date);
  })
  .catch(function (error) {
    throw error;
  })
  .done();
};

// expose module to the outside world
process.on('message', function (options) {
  var emailer = new MailPlugin(options);
});
