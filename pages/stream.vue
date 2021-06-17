<template>
  <div class="wrapper">
    <div class="main">
      <div v-if="role === Constants.ROLE_UNSELECT" class="d-flex justify-center">
        <v-btn @click="setRole(Constants.ROLE_ROOM_CREATER)" class="mr-4">配信を開始する</v-btn>
        <v-btn @click="setRole(Constants.ROLE_ROOM_PARTICIPANT)">視聴する</v-btn>
      </div>
      <div v-else class="d-flex flex-column align-center mb-4">
        <div class="text-sm-body-2 text--secondary mb-2">半角英数字で入力してください。</div>
        <div class="name d-flex justify-center align-center mb-4">
          <div class="head mr-1">あなたの名前：</div>
          <div class="input">
            <input v-model="myName" :disabled="isConnecting" type="text" />
          </div>
        </div>
        <div
          v-if="role === Constants.ROLE_ROOM_PARTICIPANT"
          class="name d-flex justify-center align-center mb-4"
        >
          <div class="head mr-1">配信者名：</div>
          <div class="input">
            <input v-model="streamName" :disabled="isConnecting" type="text" />
          </div>
        </div>
        <v-btn v-if="!isConnecting" @click="connect" x-large>開始</v-btn>
        <v-btn v-else outlined @click="disconnect" x-large>切断</v-btn>
      </div>
      <div class="content">
        <div v-if="isConnecting" class="video">
          <video ref="video" autoplay playsinline></video>
        </div>
      </div>
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
  streamName: string;
  state: number;
  isConnecting: boolean;
  peer: Peer | null;
  room: object | null;
  localStream: MediaStream | undefined;
};

export default Vue.extend({
  data(): Data {
    return {
      Constants: Constants,
      role: Constants.ROLE_UNSELECT,
      myName: "",
      streamName: "",
      state: Constants.STATE_DISCONNECTED,
      isConnecting: false,
      peer: null,
      room: null,
      localStream: undefined
    };
  },
  methods: {
    setRole(role: number) {
      this.role = role;
    },
    async connect() {
      if (this.role == Constants.ROLE_ROOM_CREATER) {
        // 配信者側
        if (Utils.checkName(this.myName, "自分の名前")) {
          this.isConnecting = true;
          this.peer = new Peer(this.myName, {
            key: this.$config.SKYWAY_API_KEY,
            debug: 3
          });
          this.peer.on("open", async () => {
            await this.setMyStream();
            await this.playMyStream();
            this.joinRoom(this.myName);
            Utils.scrollToBottom();
          });
        }
      } else if (this.role == Constants.ROLE_ROOM_PARTICIPANT) {
        // 参加者側
        if (Utils.checkName(this.myName, "自分の名前")) {
          this.isConnecting = true;
          this.peer = new Peer(this.myName, {
            key: this.$config.SKYWAY_API_KEY,
            debug: 3
          });
          this.peer.on("open", () => {
            this.joinRoom(this.streamName);
            this.playOtherStream(this.room);
          });
        }
      }
    },
    async setMyStream() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      this.localStream = stream;
    },
    playMyStream: async function() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      const video = this.$refs.video as HTMLMediaElement;
      video.srcObject = stream;
      this.localStream = stream;
    },
    playOtherStream(src: any) {
      src.on("stream", (stream: any) => {
        // TODO
        const video = this.$refs.video as HTMLMediaElement;
        video.srcObject = stream;
        this.state = Constants.STATE_CONNECTED;
      });
    },
    joinRoom: function(roomName: string) {
      if (this.peer) {
        this.room = this.peer.joinRoom(roomName, {
          mode: "sfu",
          stream: this.localStream
        });
      }
    },
    disconnect() {
      if (this.peer) this.peer.destroy();
      if (this.localStream) {
        const tracks: MediaStreamTrack[] = this.localStream.getTracks();
        tracks.forEach((track: MediaStreamTrack) => {
          track.stop();
        });
      }
      this.isConnecting = false;
      this.state = Constants.STATE_DISCONNECTED;
    },
    checkPeer(peer: Peer) {
      peer.on("error", (error: ErrorEvent) => {
        if (error.type === "unavailable-id") {
          alert("現在その名前は既に使われています。");
        } else {
          alert("エラーが発生しました。");
        }
        this.disconnect();
      });
    },
    scrollToBottom() {
      const element = document.documentElement;
      const bottom = element.scrollHeight - element.clientHeight;
      window.scrollTo({
        top: bottom,
        behavior: "smooth"
      });
    }
  },
  beforeDestroy() {
    this.disconnect();
  }
});
</script>

<style lang="scss" scoped>
</style>