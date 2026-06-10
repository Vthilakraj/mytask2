const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templateCache = new Map();

function compileTemplate(templateName) {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const compiled = Handlebars.compile(source);

  templateCache.set(templateName, compiled);
  return compiled;
}

function render(templateName, context) {
  const template = compileTemplate(templateName);
  return template(context);
}

module.exports = { render };
