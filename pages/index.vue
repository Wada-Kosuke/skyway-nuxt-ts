<template>
  <div class="container mt-8">
    <ul class="list">
      <li v-for="item in items" :key="item.url" class="item">
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
          text: "通話形式（１：１）",
          url: "/phone"
        },
        {
          text: "ビデオ通話形式（１：１）",
          url: "/video"
        },
        {
          text: "グループ通話形式（ｎ：ｎ）",
          url: "/"
        },
        {
          text: "配信形式（１：ｎ）",
          url: "/stream"
        }
      ]
    };
  }
});
</script>

<style lang="scss" scoped>
.container {
  width: 280px;
  background: #444;
  padding: 20px;
  margin: 0 auto;

  > .list {
    padding: 0;

    > .item {
      &:not(:first-child) {
        margin-top: 20px;
      }

      > a {
        width: 100%;

        > .v-btn {
          width: 100%;
        }
      }
    }
  }
}
.v-btn {
  text-transform: none;
}
</style>
