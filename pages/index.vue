<template>
  <div class="container">
    <ul class="list d-flex flex-column justify-center">
      <li v-for="item in items" :key="item.url" class="my-3 item">
        <nuxt-link :to="item.url">
          <v-btn class="py-5 px-4">{{item.text}}</v-btn>
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

type Item = {
  text: string;
  url: string;
};

type Data = {
  items: Item[];
};

export default Vue.extend({
  data(): Data {
    return {
      items: [
        {
          text: "通話形式",
          url: "/phone"
        },
        {
          text: "ビデオ通話形式",
          url: "/video"
        },
        {
          text: "グループ通話形式",
          url: "/"
        },
        {
          text: "配信形式",
          url: "/stream"
        }
      ]
    };
  }
});
</script>

<style lang="scss" scoped>
.container {
  width: 210px;
  margin: 0 auto;
}

.v-btn {
  width: 100%;
}
</style>
