<template>
  <v-row justify="center" align="center" class="mt-6">
    <v-col cols="12" sm="8" md="6">
      <v-list>
        <v-list-item v-for="item in items" :key="item.title">
          <v-list-item-content class="flex-column align-start">
            <v-list-item-title class="align-self-start mb-2">{{item.title}}</v-list-item-title>
            <div class="btns flex-column">
              <v-btn
                @click="selectBtn(item.btn1.modalText, item.type, item.btn1.role)"
                class="mr-2"
              >{{item.btn1.text}}</v-btn>
              <v-btn
                @click="selectBtn(item.btn1.modalText, item.type, item.btn1.role)"
              >{{item.btn2.text}}</v-btn>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>
    <div v-if="isShowModal" class="modal">
      <div class="modal-bg" @click="closeModal"></div>
      <div class="modal-content rounded-lg d-flex flex-column">
        <div class="modal-title mb-2">{{modalText}}</div>
        <div class="input mb-4">
          <input v-model="inputValue" class="rounded" type="text" />
        </div>
        <div class="btns d-flex align-self-center">
          <v-btn @click="moveToSkywayPage" class="mr-6">決定</v-btn>
          <v-btn @click="closeModal">キャンセル</v-btn>
        </div>
      </div>
    </div>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Constants from "~/plugins/constants";

type Type = "phone" | "video" | "group" | "stream";

type Item = {
  title: string;
  type: Type;
  btn1: object;
  btn2: object;
};

type DataType = {
  modalText: string;
  type: Type | null;
  role: number | null;
  inputValue: string;
  items: Item[];
  isShowModal: boolean;
};

export default Vue.extend({
  data(): DataType {
    return {
      modalText: "",
      type: null,
      role: null,
      inputValue: "",
      items: [
        {
          title: "通話形式（１：１）",
          type: "phone",
          btn1: {
            text: "通話をかける",
            role: Constants.ROLE_CALLER,
            modalText: "相手の名前を入力してください"
          },
          btn2: {
            text: "通話待機",
            role: Constants.ROLE_RECEIVER,
            modalText: "自分の名前を入力してください"
          }
        },
        {
          title: "ビデオ通話形式（１：１）",
          type: "video",
          btn1: {
            text: "通話をかける",
            role: Constants.ROLE_CALLER,
            modalText: "相手の名前を入力してください"
          },
          btn2: {
            text: "通話待機",
            role: Constants.ROLE_RECEIVER,
            modalText: "自分の名前を入力してください"
          }
        },
        {
          title: "グループ通話形式（ｎ：ｎ）",
          type: "group",
          btn1: {
            text: "通話を開始",
            role: Constants.ROLE_ROOM_CREATER,
            modalText: "グループ名を入力してください"
          },
          btn2: {
            text: "通話に参加",
            role: Constants.ROLE_ROOM_PARTICIPANT,
            modalText: "グループ名を入力してください"
          }
        },
        {
          title: "配信形式（１：ｎ）",
          type: "stream",
          btn1: {
            text: "配信を開始",
            role: Constants.ROLE_ROOM_CREATER,
            modalText: "配信名を入力してください"
          },
          btn2: {
            text: "配信に参加",
            role: Constants.ROLE_ROOM_PARTICIPANT,
            modalText: "配信名を入力してください"
          }
        }
      ],
      isShowModal: false
    };
  },
  methods: {
    selectBtn(modalText: string, type: Type | null, role: number | null) {
      this.modalText = modalText;
      this.type = type;
      this.role = role;
      this.isShowModal = true;
    },
    moveToSkywayPage() {
      if (!this.inputValue) return;
      this.$router.push(`/${this.type}?role=${this.role}`);
    },
    closeModal() {
      this.isShowModal = false;
      this.inputValue = "";
    }
  }
});
</script>

<style lang="scss" scoped>
.v-list {
  .btns {
    button {
      min-width: 130px;
    }
  }
}

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
