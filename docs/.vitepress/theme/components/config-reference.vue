<script setup lang="ts">
import schema from '../../../public/commit-jazzer-schema.json';

type SchemaNode = {
  additionalProperties?: boolean | SchemaNode;
  default?: unknown;
  description?: string;
  enum?: unknown[];
  items?: SchemaNode;
  properties?: Record<string, SchemaNode>;
  propertyNames?: SchemaNode;
  type?: string;
}

type Row = {
  defaultValue?: string;
  /** 0 for top-level options; the heading level follows it. */
  depth: number;
  description: string;
  path: string;
  type: string;
  values?: string;
}

// Enums longer than this (colors, figlet fonts) are summarised instead of listed.
const MAX_LISTED_VALUES = 8;

const describeType = (node: SchemaNode): string => {
  if (node.type === 'array' && node.items) {
    return `${describeType(node.items)}[]`;
  }

  if (node.type === 'object' && typeof node.additionalProperties === 'object') {
    return `Record<string, ${describeType(node.additionalProperties)}>`;
  }

  return node.type ?? 'unknown';
};

const describeValues = (node: SchemaNode): string | undefined => {
  const values = node.enum ?? node.items?.enum ?? node.propertyNames?.enum;

  if (!values) {
    return undefined;
  }

  return values.length > MAX_LISTED_VALUES
    ? `one of ${values.length} values, see the JSON Schema`
    : values.map((value) => JSON.stringify(value)).join(' | ');
};

// The fields inside an object, a record (`aliases.<name>.title`) or an array (`baseQuestionsOptions[].key`).
const childrenOf = (node: SchemaNode): { properties: Record<string, SchemaNode>; suffix: string } | undefined => {
  if (node.properties) {
    return { properties: node.properties, suffix: '.' };
  }

  if (typeof node.additionalProperties === 'object' && node.additionalProperties.properties) {
    return { properties: node.additionalProperties.properties, suffix: '.<name>.' };
  }

  if (node.items?.properties) {
    return { properties: node.items.properties, suffix: '[].' };
  }

  return undefined;
};

const toRows = ({ properties, prefix = '', depth = 0 }: { properties: Record<string, SchemaNode>; prefix?: string; depth?: number }): Row[] =>
  Object.entries(properties).flatMap(([name, node]) => {
    if (name === '$schema') {
      return [];
    }

    const path = `${prefix}${name}`;
    const children = childrenOf(node);
    const nested = children ? toRows({ properties: children.properties, prefix: `${path}${children.suffix}`, depth: depth + 1 }) : [];
    const row: Row = {
      path,
      depth,
      type: describeType(node),
      values: describeValues(node),
      defaultValue: node.default === undefined ? undefined : JSON.stringify(node.default),
      description: node.description ?? ''
    };

    return [row, ...nested];
  });

const rows = toRows({ properties: schema.properties });
</script>

<template>
  <div v-for="row in rows" :key="row.path" class="option">
    <component :is="row.depth === 0 ? 'h2' : 'h3'" :id="row.path">
      <code>{{ row.path }}</code>
      <a class="header-anchor" :href="`#${row.path}`" :aria-label="`Permalink to ${row.path}`" />
    </component>
    <p class="meta">
      <span>Type: <code>{{ row.type }}</code></span>
      <span v-if="row.defaultValue">
        · Default: <code>{{ row.defaultValue }}</code></span>
    </p>
    <p v-if="row.values" class="meta">
      Values: <code>{{ row.values }}</code>
    </p>
    <p v-if="row.description">
      {{ row.description }}
    </p>
  </div>
</template>

<style scoped>
.option h2,
.option h3 {
  margin-top: 32px;
}

.meta {
  margin: 4px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.meta code {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
