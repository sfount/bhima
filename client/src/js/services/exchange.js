angular.module('bhima.services')
.service('exchange', [
  '$timeout',
  'store',
  'appstate',
  'messenger',
  'precision',
  function ($timeout, Store, appstate, messenger, precision) {
    // FIXME: this module needs to be able to do
    // exchange.setRate() so that it can detect changes
    var called = false;
    var cfg = {};

    function normalize (date) {
      return date.setHours(0,0,0,0);
    }

    function exchange (value, currency_id, date) {
      // This function exchanges data from the currency specified by currency_id to
      // the enterprise currency on a given date (default: today).
      date = date || new Date();
      date = normalize(new Date(date));
      if (!exchange.store) { return value; }

      var store = exchange.store.get(date);
      if (!store && !called) { // HACK to only show one messenger instance
        messenger.danger('No exchange rates loaded for date: ' + new Date(date));
        called = true;
        $timeout(function () { called = false; }, 50);
      }

      return precision.round(exchange.store && store && store.rateStore.get(currency_id) ? store.rateStore.get(currency_id).rate * value : value);
    }

    exchange.rate = function rate (value, currency_id, date) {
      /* jshint unused : false */
      date = date || new Date();
      date = normalize(new Date(date));
      if (!exchange.store) { return 1; }

      var store = exchange.store.get(date);
      if (!store) { messenger.danger('No exchange rates loaded for date: ' + new Date(date)); }
      return precision.round(exchange.store && store && store.rateStore.get(currency_id) ? store.rateStore.get(currency_id).rate : 1);
    };

    exchange.hasExchange = function hasExchange () {
      return !!exchange.store && !!Object.keys(exchange.store).length;
    };

    exchange.hasDailyRate = function hasDailyRate () {
      var date = normalize(new Date());
      return !!exchange.store && !!exchange.store.get(date);
    };

    exchange.convertir = function convertir (value, from_currency_id, to_currency_id, date) {
      date = new Date(date) || new Date();
      date = normalize(date);
      var converter = exchange.store.get(date);
      if(!converter) { messenger.danger('No exchange rates loaded for date: ' + new Date(date)); return;}

      var from = converter.rateStore.data.filter(function (item) {
        return item.id === from_currency_id;
      })[0];

      var to = converter.rateStore.data.filter(function (item) {
        return item.id === to_currency_id;
      })[0];

      return (value * to.rate) / from.rate;
    };

    function createDailyRateStore(store, rate) {
      var date = normalize(new Date(rate.date));
      if (!store.get(date)) {
        store.post({ date : date, rateStore : new Store({ data : [] }) });
        store.get(date).rateStore.post({ id : rate.enterprise_currency_id, rate : 1}); // default rate for enterprises
        store.get(date).rateStore.post({
          id : rate.foreign_currency_id,
          rate : rate.rate,
        });
      } else {
        store.get(date).rateStore.post({
          id : rate.foreign_currency_id,
          rate : rate.rate,
        });
      }
    }

    function loadRates(rates) {
      // loads in an array of rates
      cfg.rates = rates;
      $timeout(function () { exchange.hasExchange(); }); // Force refresh

      var store = exchange.store = new Store({ identifier : 'date', data : [] });

      rates.forEach(function (rate) {
        createDailyRateStore(store, rate);
      });
    }

    function forceRefresh() {
      loadRates(appstate.get('exchange_rate'));
    }

    exchange.forceRefresh = forceRefresh;

    appstate.register('exchange_rate', loadRates);

    return exchange;
  }
]);
