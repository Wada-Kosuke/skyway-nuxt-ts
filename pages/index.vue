<template>
  <v-row justify="center" align="center" class="mt-6">
    <v-col cols="12" sm="8" md="6">
      <v-list>
        <v-list-item v-for="item in items" :key="item.title">
          <v-list-item-content class="flex-column align-start">
            <v-list-item-title class="align-self-start mb-2">{{item.title}}</v-list-item-title>
            <div class="btns flex-column">
              <v-btn @click="selectType" class="mr-2">{{item.btn1}}</v-btn>
              <v-btn @click="selectType">{{item.btn2}}</v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>
    <div v-if="isShowModal" class="modal">
      <div class="modal-bg" @click="closeModal"></div>
      <div class="modal-content rounded-lg d-flex flex-column">
        <div class="modal-title mb-2">名前を入力してください</div>
        <div class="input mb-4">
          <input class="rounded" type="text" />
        </div>
        <div class="btns d-flex align-self-center">
          <v-btn class="mr-6">決定</v-btn>
          <v-btn>キャンセル</v-btn>
        </div>
      </div>
    </div>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
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
      ],
      isShowModal: false
    };
  },
  methods: {
    selectType() {
      this.isShowModal = true;
    },
    closeModal() {
      this.isShowModal = false;
    }
  }
});
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  > .modal-bg {
    position: fixed;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: #000;
    opacity: 0.5;
  }

  > .modal-content {
    z-index: 2;
    width: 80%;
    background: #fff;
    padding: 20px;
    border: 1px solid gray;

    > .modal-title {
      color: #333;
    }

    > .btns {
      > button {
        min-width: 110px;
      }
    }
  }
}
</style>
