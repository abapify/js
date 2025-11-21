import { createNamespace } from '../../base/namespace';

export const atom = createNamespace({
  uri: 'http://www.w3.org/2005/Atom',
  prefix: 'atom',
});

export const AtomLinkSchema = atom.schema({
  tag: 'atom:link',
  fields: {
    href: atom.attr('href'),
    rel: atom.attr('rel'),
    type: atom.attr('type'),
    title: atom.attr('title'),
  },
} as const);
