<template>
  <v-row justify="center" align="center" class="mt-6">
    <v-col cols="12" sm="6">
      <v-list>
        <v-list-item v-for="item in items" :key="item.title">
          <v-list-item-content class="flex-column align-start">
            <nuxt-link :to="item.url">
              <v-btn class="mr-2 py-5 px-4">{{item.text}}</v-btn>
            </nuxt-link>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
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
          url: "/"
        },
        {
          text: "グループ通話形式（ｎ：ｎ）",
          url: "/"
        },
        {
          text: "配信形式（１：ｎ）",
          url: "/"
        }
      ]
    };
  }
});
</script>

<style lang="scss" scoped>
.v-btn {
  text-transform: none;
}
</style>
