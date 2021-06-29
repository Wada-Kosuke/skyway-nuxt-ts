<template>
  <div class="name d-flex flex-column flex-md-row justify-center align-start align-md-center mb-4">
    <div class="head">{{head}}：</div>
    <div class="input">
      <input @input="emitName1" :disabled="isStarted" type="text" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  model: {
    prop: "name1",
    event: "emit-name1"
  },
  props: {
    name1: {
      type: String
    },
    head: {
      type: String
    },
    isStarted: {
      type: Boolean
    }
  },
  methods: {
    emitName1(e: InputEvent) {
      this.$emit("emit-name1", (e.target as HTMLInputElement).value);
    }
  }
});
</script>