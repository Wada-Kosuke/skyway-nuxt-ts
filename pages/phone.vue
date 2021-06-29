<template>
  <div class="wrapper px-2 mx-auto">
    <div class="main">
      <SelectRole
        v-if="role === Constants.ROLE_UNSELECT"
        :role1="Constants.ROLE_CALLER"
        :role2="Constants.ROLE_RECEIVER"
        btnText1="通話をかける"
        btnText2="通話を待つ"
        @set-role="setRole"
      ></SelectRole>
      <div v-else class="d-flex flex-column align-center">
        <div class="text-sm-body-2 text--secondary mb-2">半角英数字で入力してください。</div>
        <NameInput1 v-model="name1" head="あなたの名前" :isStarted="isStarted"></NameInput1>
        <NameInput2
          v-if="role === Constants.ROLE_CALLER"
          v-model="name2"
          head="相手の名前"
          :isStarted="isStarted"
        ></NameInput2>
        <v-btn outlined v-if="!isStarted" @click="connect" large>接続</v-btn>
        <v-btn v-else outlined @click="disconnect" large>切断</v-btn>
        <div v-if="isStarted" class="state mt-12">{{stateText}}</div>
      </div>
      <audio ref="audio" autoplay></audio>
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
  name1: string;
  name2: string;
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
      name1: "",
      name2: "",
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
    connect() {
      // 有効な名前かチェック
      if (!Utils.checkName(this.name1, "自分の名前")) return;
      if (this.role === Constants.ROLE_CALLER) {
        if (!Utils.checkName(this.name2, "相手の名前")) return;
      }
      // SkyWayサーバーに接続
      this.peer = new Peer(this.name1, {
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
            const call = this.peer.call(this.name2, this.localStream);
            this.onStream(call);
          } else if (this.role === Constants.ROLE_RECEIVER) {
            // 着信側
            this.peer.on("call", (call: MediaConnection) => {
              alert(`${call.remoteId}から着信がありました。`);
              call.answer(this.localStream);
              this.onStream(call);
            });
          }
        }
      });
    },
    async setMyStream() {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
    },
    onStream(call: MediaConnection) {
      call.on("stream", (stream: MediaStream) => {
        this.state = Constants.STATE_CONNECTED;
        this.playOtherStream(stream);
        if (this.role === Constants.ROLE_RECEIVER) this.name2 = call.remoteId;
      });
      call.on("close", () => {
        alert("接続が切断されました。");
        this.disconnect();
      });
    },
    playOtherStream(stream: MediaStream) {
      const audio = this.$refs.audio as HTMLMediaElement;
      audio.srcObject = stream;
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
          this.stateText = `${this.name2}と接続中`;
        }
      }
    }
  },
  beforeDestroy() {
    this.disconnect();
  }
});
</script>