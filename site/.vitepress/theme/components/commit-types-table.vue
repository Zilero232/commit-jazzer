<script setup lang="ts">
import { DEFAULT_COMMIT_TYPES } from '../../../../src/core/commit-types/commit-types.constants';
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Emoji</th>
        <th>Code</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="type in DEFAULT_COMMIT_TYPES" :key="type.name">
        <td>
          <code>{{ type.name }}</code>
        </td>
        <td>{{ type.emoji }}</td>
        <td>
          <code>{{ type.code }}</code>
        </td>
        <td>{{ type.description }}</td>
      </tr>
    </tbody>
  </table>
</template>
