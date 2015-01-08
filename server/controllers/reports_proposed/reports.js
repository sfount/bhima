var path                  = require('path');
var fs                    = require('fs');
var q                     = require('q');

// Import and compile template files
var dots                  = require('dot').process({path : path.join(__dirname, 'templates')});

var wkhtmltopdf           = require('wkhtmltopdf');
var uuid                  = require('./../../lib/guid');
var config                = require('./config');

// Document contexts
var invoiceContext        = require('./data/invoice');
var balanceSheetContext   = require('./data/balance_sheet');
var completeBalanceContext  = require('./data/complete_balance');
var incomeExpenseContext  = require('./data/income_expense');
var accountsReceivableContext = require('./data/accounts_receivable_aged');

// Module configuration 
var writePath = path.join(__dirname, 'out/');

// Map templates and context compilation to request targets
var documentHandler = { 
  invoice : { 
    template : dots.invoice,
    context : invoiceContext
  }, 
  balance_sheet : { 
    template : dots.balance_sheet, 
    context : balanceSheetContext
  },
  complete_balance : { 
    template : dots.complete_balance,
    context : completeBalanceContext
  },
  income_expense : { 
    template : dots.income_expense,
    context : incomeExpenseContext
  }, 
  accounts_receivable_aged : { 
    template: dots.accounts_receivable_aged, 
    context : accountsReceivableContext
  }
};

// Perform initial settup
initialise();

exports.serve = function (req, res, next) {
  var target = req.params.target;
  var options = {root : writePath};
  
  res.sendFile(target.concat('.pdf'), options, function (err, res) { 
    if (err) { 
      res.status(err.status).end();
    } else { 
  
      // Delete (unlink) served file
      /*fs.unlink(path.join(__dirname, 'out/').concat(target, '.pdf'), function (err) { 
        if (err) throw err;
      });*/
    }
  });
};

exports.build = function (req, res, next) {  
  var target = req.params.route; 
  var renderTarget = renderPDF;
  
  var handler = documentHandler[target];
  var options = req.body;

  // Module does not support the requested document
  if (!handler) { 
    res.status(500).end('Invalid document target');
  } else { 
        
    handler.context.compile(options)
    .then(renderTarget)
    .catch(next);
  }
  
  function renderPDF(reportData) { 
    var compiledReport;
    var hash = uuid();
  
    var format = options.format || 'standard';
    var language = options.language || 'en';
    var configuration = buildConfiguration(hash, format); 
    
    // Ensure templates have path data
    reportData.path = reportData.path || __dirname;
    compiledReport = handler.template(reportData);

  

    // wkhtmltopdf exceptions not handled
    var pdf = wkhtmltopdf(compiledReport, configuration, function (code, signal, a) { 
      
      // Return path to file service
      res.send('/report/serve/' + hash);
    });
  }
};

// Return configuration object for wkhtmltopdf process
function buildConfiguration(hash, size) { 
  var context = config[size] || config.standard;
  var hash = hash || uuid();
    
  context.output = writePath.concat(hash, '.pdf');
  return context;
}

function initialise() { 
  
  // Ensure write folder exists - wkhtmltopdf will silently fail without this
  fs.exists(writePath, function (exists) { 
    
    if (!exists) { 
      fs.mkdir(writePath, function (err) { 
        if (err) throw err;

        console.log('[controllers/report] output folder written :', writePath);
      });
    }
  });
}
