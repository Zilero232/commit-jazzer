import Handlebars from 'handlebars';

// An isolated instance, so helpers registered by other packages never leak in.
const handlebars = Handlebars.create();

const cache = new Map<string, Handlebars.TemplateDelegate>();

/** Compiles (once) a Handlebars template that renders plain text: `&` or `<` stay as typed. */
export const compileTemplate = (template: string): Handlebars.TemplateDelegate => {
  const cached = cache.get(template);

  if (cached) {
    return cached;
  }

  const compiled = handlebars.compile(template, { noEscape: true });

  cache.set(template, compiled);

  return compiled;
};
