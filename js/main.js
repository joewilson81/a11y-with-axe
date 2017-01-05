axe.configure({
  reporter: "v2",
  checks: [
    {
      id: "link-must-have-href",
      evaluate: (node, options) => {
        let href = node.getAttribute("href");

        if ( !href || href === "#" || href.startsWith("javascript:void") ) {
          return false;
        }

        return true;
      },
      metadata: {
        impact: "critical",
        messages: {
          pass: "All links have an href attribute. Good job!",
          fail: "Links must have a non-empty href attribute in order to be considered true links and to be accessible to keyboard users. See http://webaim.org/techniques/hypertext/"
        }
      }
    }
  ],
  rules: [
    {
      id: "heading-order",
      enabled: true
    },
    {
      id: "links",
      enabled: true,
      selector: "a",
      tags: ['dem-custom-rules'],
      all: [
        "link-must-have-href"
      ]
    }
  ]
});

axe.run(function (err, results) {
  if (err) throw err;

  const target = document.getElementById("axe-report");

  if (results.violations.length === 0) {
    target.innerHTML = "I couldn't find any accessibility errors using the provided rule set. Good jaerb!";
  }
  else {
    target.innerHTML = '<dl class="violations">' + results.violations.reduce((message, violation, index) => {
      const separator = index > 0 ? '<hr />' : '';
      return message + separator + formatAxeViolation(violation);
    }, "") + '</dl>';
  }

});

function formatAxeViolation(violation) {
  let message = `<dt class="${violation.impact}">`;

  message += `[<a href="${violation.helpUrl}">${violation.id}</a>] ${violation.help ? violation.help : ''}<br />`;
  if ( violation.description ) { message += `${violation.description}`; }
  message += '</dt>';

  if (violation.nodes && violation.nodes.length) {
    message += '<dd>' + violation.nodes.reduce((nodesMessage, node) => {
      return nodesMessage + formatAxeNode(node);
    }, "") + '</dd>';
  }

  return message;
}

function formatAxeNode(node) {
  let message = `<pre>${node.target.toString()}</pre>`;

  if (node.all && node.all.length) {
    message += "Passes if all of the following are true: " + node.all.reduce((nodeMessage, part) => {
      return nodeMessage + formatAxeNodePart(part);
    }, "");
  }

  if (node.any && node.any.length) {
    message += "Passes if any of the following are true: " + node.any.reduce((nodeMessage, part) => {
      return nodeMessage + formatAxeNodePart(part);
    }, "");
  }

  return message;
}

function formatAxeNodePart(part) {
  return `<p class="${part.impact}">${part.id}: ${part.message}</p>`;
}
