var JSHINT = require('jshint').JSHINT;
var _ = require('lodash');

function addMessage(message, opt_class) {
  var output = document.querySelector('#output');
  var messageEl = document.createElement('p');
  if (opt_class) {
    messageEl.classList.add(opt_class);
  }
  var messages = _.isArray(message) ? message : [message];
  messages.forEach(function(msg) {
    var msgEl = document.createElement('div');
    msgEl.textContent = msg;
    messageEl.appendChild(msgEl);
  });
  output.appendChild(messageEl);
}

function addError(message) {
  addMessage(message, 'error');
}

function addWarning(message) {
  addMessage(message, 'warning');
}

function jshint(src) {
  var config = require('./jshintconfig');
  var globals = config.globals;
  JSHINT(src, config, globals);
  var result = JSHINT.data();
  if (!result.errors) {
    return;
  }
  result.errors.forEach(function(error) {
    var template =_.template('[JSHint] Line <%= line %>, <%= reason %> (<%= code %>)');
    var messages = [
      template(error),
      error.evidence
    ];
    addError(messages);
  });
}

function doEslint(src) {
  var config = require('./eslintconfig');
  var errors = eslint.verify(src, config);
  errors.forEach(function(msg) {
    var template = _.template('[ESLint] Line <%= line %>, <%= message %> (<%= ruleId %>)');
    var messages = [
      template(msg)
    ];
    if (msg.source.length < src.length / 2) {
      // 該当行のソースがコード全体になることが多いので、結果の可読性を上げるため
      // 該当行のソースがコード全体の半分より長いときはソースを表示しない
      messages.push(msg.source);
    }
    addError(messages);
  });
}

function jsprime(src) {
  var iframe = document.createElement('iframe');
  iframe.src = 'html/jsprime.html';
  document.body.appendChild(iframe);
  return new Promise(function(resolve, reject) {
    iframe.onload = function() {
      iframe.contentWindow.analyze(src);
      var lineEls = iframe.contentDocument.querySelectorAll('h5[style="color:red"] + p + .context .lines');
      var codeEls = iframe.contentDocument.querySelectorAll('h5[style="color:red"] + p + .context .inner-code');
      var lines = _.map(lineEls, function(el) {
        return el.textContent;
      });
      var codes = _.map(codeEls, function(el) {
        return el.textContent;
      });
      lines.forEach(function(line, i) {
        var template = _.template('Line <%= line %>, XSS Warning!!:');
        var messages = [
          template({line: line}),
          codes[i]
        ];
        addWarning(messages);
      });
      iframe.parentNode.removeChild(iframe);
      resolve();
    };
  });

}

function lgtm(p) {
  p.then(function() {
    var output = document.querySelector('#output');
    if (output.childNodes.length === 0) {
      output.innerHTML = '<div class="lgtm">✓ Looks good to me!</div>'
    }
  });
}

function review(src) {
  doEslint(src);
  jshint(src);
  var promise = jsprime(src);
  lgtm(promise);
}

function main() {
  var editor = ace.edit("input");
  editor.getSession().setMode("ace/mode/javascript");
  editor.getSession().setUseWorker(false);
  var output = document.querySelector('#output');
  editor.addEventListener('input', _.debounce(function() {
    output.innerHTML = '';
    review(editor.getValue());
  }, 500));
  // サンプルコードを解析
  review(editor.getValue());
}

main();
