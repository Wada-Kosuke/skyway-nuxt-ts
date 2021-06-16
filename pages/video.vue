<template>
  <v-row justify="center" align="center" class="mt-12">
    <v-col cols="12" sm="8">
      <div v-if="role === Constants.ROLE_UNSELECT" class="content d-flex justify-center">
        <v-btn @click="setRole(Constants.ROLE_CALLER)" class="mr-4">通話をかける</v-btn>
        <v-btn @click="setRole(Constants.ROLE_RECEIVER)">通話を待つ</v-btn>
      </div>
      <div v-else class="container d-flex flex-column align-center">
        <div class="notice mb-2">半角英数字で入力してください。</div>
        <div class="name mb-4">
          <div class="head">あなたの名前：</div>
          <input v-model="myName" :disabled="isConnecting" type="text" />
        </div>
        <div v-if="role === Constants.ROLE_CALLER" class="name mb-4">
          <div class="head">相手の名前：</div>
          <input v-model="otherName" :disabled="isConnecting" type="text" />
        </div>
        <v-btn v-if="!isConnecting" @click="connect" x-large>接続</v-btn>
        <v-btn v-else outlined @click="disconnect" x-large>切断</v-btn>
        <div v-if="isConnecting" class="state mt-12">{{stateText}}</div>
      </div>
    </v-col>
    <div v-if="isConnecting" class="video">
      <video ref="video" autoplay playsinline></video>
    </div>
  </v-row>
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
  isConnecting: boolean;
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
      isConnecting: false,
      peer: null,
      localStream: undefined
    };
  },
  methods: {
    setRole(role: number) {
      this.role = role;
    },
    async connect() {
      if (this.role == Constants.ROLE_CALLER) {
        // 発信側
        if (
          Utils.checkName(this.myName, "自分の名前") &&
          Utils.checkName(this.otherName, "相手の名前")
        ) {
          this.isConnecting = true;
          this.peer = new Peer(this.myName, {
            key: this.$config.SKYWAY_API_KEY,
            debug: 3
          });
          this.checkPeer(this.peer);
          this.peer.on("open", async () => {
            if (this.peer) {
              await this.setMyStream();
              const call = this.peer.call(this.otherName, this.localStream);
              call.on("stream", (stream: MediaStream) => {
                this.playOtherStream(stream);
                Utils.scrollToBottom();
              });
            }
          });
        }
      } else if (this.role == Constants.ROLE_RECEIVER) {
        // 着信側
        if (Utils.checkName(this.myName, "自分の名前")) {
          this.isConnecting = true;
          this.peer = new Peer(this.myName, {
            key: this.$config.SKYWAY_API_KEY,
            debug: 3
          });
          this.checkPeer(this.peer);
          this.peer.on("open", async () => {
            await this.setMyStream();
            if (this.peer) {
              this.peer.on("call", (call: MediaConnection) => {
                call.answer(this.localStream);
                call.on("stream", (stream: MediaStream) => {
                  this.playOtherStream(stream);
                  this.otherName = call.remoteId;
                  Utils.scrollToBottom();
                });
              });
            }
          });
        }
      }
    },
    async setMyStream() {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
    },
    playOtherStream(stream: MediaStream) {
      const video = this.$refs.video as HTMLMediaElement;
      video.srcObject = stream;
      this.state = Constants.STATE_CONNECTED;
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
.notice {
  font-size: 14px;
  opacity: 0.6;
}

.name {
  display: flex;
  align-items: center;
  width: 100%;

  > .head {
    min-width: 114px;
  }
}

.video {
  width: 80%;
  max-width: 80%;
  margin: 0 auto 10px;

  > video {
    width: 100%;
  }
}
</style>