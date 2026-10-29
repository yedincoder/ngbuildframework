
export type Child =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[];

export type Props = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface VNode {
  tag: string;
  props: Props;
  children: Child[];
}

export type Component<P = Props> = (props: P) => Child;

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

const BLOCKED_ELEMENTS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'base',
  'frame',
  'frameset'
]);

const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'action',
  'formaction',
  'poster',
  'cite',
  'xlink:href'
]);

const SAFE_ATTRIBUTE_NAME = /^[a-zA-Z_:][a-zA-Z0-9_:.-]*$/;
const SAFE_TAG_NAME = /^[a-zA-Z][a-zA-Z0-9-]*$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeUrl(value: string): boolean {
  const normalized = value
    .replace(/[\u0000-\u0020\u007f]/g, '')
    .toLowerCase();

  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:')
  ) {
    return false;
  }

  return true;
}

function renderAttributes(props: Props): string {
  const safeProps: Props = {};

  for (const [key, value] of Object.entries(props)) {
    if (
      value === null ||
      value === undefined ||
      value === false
    ) {
      continue;
    }

    if (!SAFE_ATTRIBUTE_NAME.test(key)) {
      continue;
    }

    const name = key.toLowerCase();

    if (name.startsWith('on')) {
      continue;
    }

    if (
      URL_ATTRIBUTES.has(name) &&
      !isSafeUrl(String(value))
    ) {
      continue;
    }

    safeProps[key] = value;
  }

  const target = Object.entries(safeProps).find(
    ([key]) => key.toLowerCase() === 'target'
  );

  if (target && target[1] === '_blank') {
    const relEntry = Object.entries(safeProps).find(
      ([key]) => key.toLowerCase() === 'rel'
    );

    const relKey = relEntry?.[0] ?? 'rel';
    const relValue = typeof relEntry?.[1] === 'string'
      ? relEntry[1]
      : '';

    const tokens = new Set(
      relValue.toLowerCase().split(/\s+/).filter(Boolean)
    );

    tokens.add('noopener');
    tokens.add('noreferrer');

    safeProps[relKey] = [...tokens].join(' ');
  }

  return Object.entries(safeProps)
    .map(([key, value]) => {
      if (value === true) {
        return ` ${key}`;
      }

      return ` ${key}="${escapeHtml(String(value))}"`;
    })
    .join('');
}

export function element(
  tag: string,
  props: Props = {},
  ...children: Child[]
): VNode {
  return {
    tag,
    props,
    children
  };
}

export function component<P>(
  fn: Component<P>,
  props: P
): Child {
  return fn(props);
}

export function render(node: Child): string {
  if (Array.isArray(node)) {
    return node.map(render).join('');
  }

  if (
    node === null ||
    node === undefined ||
    typeof node === 'boolean'
  ) {
    return '';
  }

  if (
    typeof node === 'string' ||
    typeof node === 'number'
  ) {
    return escapeHtml(String(node));
  }

  if (!SAFE_TAG_NAME.test(node.tag)) {
    throw new Error(`Invalid HTML tag: ${node.tag}`);
  }

  const tag = node.tag.toLowerCase();

  if (BLOCKED_ELEMENTS.has(tag)) {
    throw new Error(`Blocked HTML tag: ${node.tag}`);
  }

  const attributes = renderAttributes(node.props);

  if (VOID_ELEMENTS.has(tag)) {
    if (node.children.length > 0) {
      throw new Error(
        `Void HTML element cannot have children: ${node.tag}`
      );
    }

    return `<${node.tag}${attributes}>`;
  }

  const content = node.children.map(render).join('');

  return `<${node.tag}${attributes}>${content}</${node.tag}>`;
}
