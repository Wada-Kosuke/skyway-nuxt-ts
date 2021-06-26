<template>
  <div class="wrapper">
    <div class="main">
      <div
        v-if="role === Constants.ROLE_UNSELECT"
        class="select-role mt-12 d-flex flex-column justify-center"
      >
        <v-btn x-large @click="setRole(Constants.ROLE_CALLER)" class="mb-6">通話をかける</v-btn>
        <v-btn x-large @click="setRole(Constants.ROLE_RECEIVER)">通話を待つ</v-btn>
      </div>
      <div v-else class="d-flex flex-column align-center">
        <div class="text-sm-body-2 text--secondary mb-2">半角英数字で入力してください。</div>
        <div class="name d-flex justify-center align-center mb-4">
          <div class="head">あなたの名前：</div>
          <div class="input">
            <input v-model="myName" :disabled="isStarted" type="text" />
          </div>
        </div>
        <div
          v-if="role === Constants.ROLE_CALLER"
          class="name d-flex justify-center align-center mb-4"
        >
          <div class="head">相手の名前：</div>
          <div class="input">
            <input v-model="otherName" :disabled="isStarted" type="text" />
          </div>
        </div>
        <v-btn outlined v-if="!isStarted" @click="connect" large>接続</v-btn>
        <v-btn v-else outlined @click="disconnect" large>切断</v-btn>
        <div v-if="isStarted" class="state mt-6 mb-3">{{stateText}}</div>
      </div>
    </div>
    <div v-if="isStarted" class="video">
      <video ref="otherVideo" class="other-video" autoplay playsinline></video>
      <video ref="myVideo" class="my-video" muted autoplay playsinline></video>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Constants from "~/plugins/constants";
import Utils from "~/plugins/utils";
import Peer, { MediaConnection } from "skyway-js";

type Data = {
  Constants: object;
  role: number;
  myName: string;
  otherName: string;
  state: number;
  stateText: string;
  isStarted: boolean;
  peer: Peer | null;
  localStream: MediaStream | undefined;
};

export default Vue.extend({
  data(): Data {
    return {
      Constants: Constants,
      role: Constants.ROLE_UNSELECT,
      myName: "",
      otherName: "",
      state: Constants.STATE_DISCONNECTED,
      stateText: "待機中…",
      isStarted: false,
      peer: null,
      localStream: undefined
    };
  },
  methods: {
    setRole(role: number) {
      this.role = role;
    },
    async connect() {
      // 有効な名前かチェック
      if (!Utils.checkName(this.myName, "自分の名前")) return;
      if (this.role === Constants.ROLE_CALLER) {
        if (!Utils.checkName(this.otherName, "相手の名前")) return;
      }
      // SkyWayサーバーに接続
      this.peer = new Peer(this.myName, {
        key: this.$config.SKYWAY_API_KEY,
        debug: 3
      });
      this.isStarted = true;
      Utils.checkPeer(this.peer, this.disconnect);
      this.peer.on("open", async () => {
        if (this.peer) {
          await this.setMyStream();
          if (this.role === Constants.ROLE_CALLER) {
            // 発信側
            const call = this.peer.call(this.otherName, this.localStream);
            this.onStream(call);
          } else if (this.role === Constants.ROLE_RECEIVER) {
            // 着信側
            this.peer.on("call", (call: MediaConnection) => {
              // alert(`${call.remoteId}から着信がありました。`);
              call.answer(this.localStream);
              this.onStream(call);
            });
          }
        }
      });
    },
    async setMyStream() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      const myVideo = this.$refs.myVideo as HTMLMediaElement;
      myVideo.srcObject = stream;
      this.localStream = stream;
    },
    onStream(call: MediaConnection) {
      call.on("stream", (stream: MediaStream) => {
        this.state = Constants.STATE_CONNECTED;
        this.playOtherStream(stream);
        if (this.role === Constants.ROLE_RECEIVER)
          this.otherName = call.remoteId;
        setTimeout(() => {
          Utils.scrollToBottom();
        }, 500);
      });
      call.on("close", () => {
        alert("接続が切断されました。");
        this.disconnect();
      });
    },
    playOtherStream(stream: MediaStream) {
      const video = this.$refs.otherVideo as HTMLMediaElement;
      video.srcObject = stream;
    },
    disconnect() {
      if (this.peer) this.peer.destroy();
      if (this.localStream) {
        const tracks: MediaStreamTrack[] = this.localStream.getTracks();
        tracks.forEach((track: MediaStreamTrack) => {
          track.stop();
        });
      }
      this.isStarted = false;
      this.state = Constants.STATE_DISCONNECTED;
    }
  },
  watch: {
    state() {
      if (this.state === Constants.STATE_DISCONNECTED) {
        this.stateText = "待機中…";
      } else if (this.state === Constants.STATE_CONNECTED) {
        if (this.role === Constants.ROLE_CALLER) {
          this.stateText = "接続中";
        } else if (this.role === Constants.ROLE_RECEIVER) {
          this.stateText = `${this.otherName}と接続中`;
        }
      }
    }
  },
  beforeDestroy() {
    this.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.video {
  position: relative;
  width: 800px;
  max-width: 90vw;
  margin: 0 auto 40px;

  > .my-video {
    width: 200px;
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>