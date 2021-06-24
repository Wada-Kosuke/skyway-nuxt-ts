<template>
  <div class="container mt-12">
    <ul class="list d-flex flex-column justify-center">
      <li v-for="item in items" :key="item.url" class="my-3 item">
        <nuxt-link :to="item.url">
          <v-btn x-large>{{item.text}}</v-btn>
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
          text: "音声通話",
          url: "/phone"
        },
        {
          text: "ビデオ通話",
          url: "/video"
        },
        {
          text: "グループ通話",
          url: "/group"
        },
        {
          text: "配信",
          url: "/stream"
        }
      ]
    };
  }
});
</script>

<style lang="scss" scoped>
.container {
  width: 220px;
  margin: 0 auto;
}

.v-btn {
  width: 100%;
}
</style>
