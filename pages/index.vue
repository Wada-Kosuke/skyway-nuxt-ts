<template>
  <v-row justify="center" align="center" class="mt-6">
    <v-col cols="12" sm="8" md="6">
      <v-list>
        <v-list-item v-for="item in items" :key="item.title">
          <v-list-item-content class="flex-column align-start">
            <v-list-item-title class="align-self-start mb-2">{{item.title}}</v-list-item-title>
            <div class="btns flex-column">
              <v-btn class="mr-2">{{item.btn1}}</v-btn>
              <v-btn>{{item.btn2}}</v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {
  data() {
    return {
      items: [
        {
          title: "通話形式（１：１）",
          btn1: "通話をかける",
          btn2: "通話待機"
        },
        {
          title: "ビデオ通話形式（１：１）",
          btn1: "通話をかける",
          btn2: "通話待機"
        },
        {
          title: "グループ通話形式（ｎ：ｎ）",
          btn1: "グループ通話を開始",
          btn2: "グループ通話に参加"
        },
        {
          title: "配信形式（１：ｎ）",
          btn1: "配信を開始",
          btn2: "配信に参加"
        }
      ]
    };
  }
};
</script>
