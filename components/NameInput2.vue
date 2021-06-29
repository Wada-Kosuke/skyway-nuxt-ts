<template>
  <div class="name d-flex flex-column flex-md-row justify-center align-start align-md-center mb-4">
    <div class="head">{{head}}：</div>
    <div class="input">
      <input @input="emitName2" :disabled="isStarted" type="text" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  model: {
    prop: "name2",
    event: "emit-name2"
  },
  props: {
    name2: {
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
    emitName2(e: InputEvent) {
      this.$emit("emit-name2", (e.target as HTMLInputElement).value);
    }
  }
});
</script>