<template>
  <div class="select-role mx-auto mt-12 d-flex flex-column justify-center">
    <v-btn x-large @click="setRole(role1)" class="mb-6">{{btnText1}}</v-btn>
    <v-btn x-large @click="setRole(role2)">{{btnText2}}</v-btn>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    role1: Number,
    role2: Number,
    btnText1: String,
    btnText2: String
  },
  methods: {
    setRole(role: Number) {
      this.$emit("set-role", role);
    }
  }
});
</script>

<style lang="scss" scoped>
.select-role {
  width: 200px;
}
</style>