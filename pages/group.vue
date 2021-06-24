<template>
  <div class="wrapper">
    <div class="main">
      <div
        v-if="role === Constants.ROLE_UNSELECT"
        class="select-role mt-12 d-flex flex-column justify-center"
      >
        <v-btn x-large @click="setRole(Constants.ROLE_ROOM_CREATER)" class="mb-6">グループを作成する</v-btn>
        <v-btn x-large @click="setRole(Constants.ROLE_ROOM_PARTICIPANT)">グループに参加する</v-btn>
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
          <div class="head mr-1">グループ作成者名：</div>
          <div class="input">
            <input v-model="groupName" :disabled="isConnecting" type="text" />
          </div>
        </div>
        <v-btn v-if="!isConnecting" @click="connect" large>開始</v-btn>
        <v-btn v-else outlined @click="disconnect" large>切断</v-btn>
      </div>
      <div class="content mb-6">
        <div v-if="isConnecting" class="videos d-flex flex-wrap">
          <div class="video pa-2">
            <video ref="myVideo" autoplay playsinline></video>
          </div>
          <div
            v-for="(stream, index) in streams"
            :key="stream.id"
            class="video pa-2"
            :class="{small: streams.length >= 5}"
          >
            <video :id="`video_${index + 1}`" autoplay playsinline></video>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Constants from "~/plugins/constants";
import Utils from "~/plugins/utils";
import Peer, { SfuRoom, RoomStream } from "skyway-js";

type Data = {
  Constants: object;
  role: number;
  myName: string;
  groupName: string;
  state: number;
  isConnecting: boolean;
  peer: Peer | null;
  room: SfuRoom | null;
  localStream: MediaStream | undefined;
  streams: RoomStream[];
};

export default Vue.extend({
  data(): Data {
    return {
      Constants: Constants,
      role: Constants.ROLE_UNSELECT,
      myName: "",
      groupName: "",
      state: Constants.STATE_DISCONNECTED,
      isConnecting: false,
      peer: null,
      room: null,
      localStream: undefined,
      streams: []
    };
  },
  methods: {
    setRole(role: number) {
      this.role = role;
    },
    async connect() {
      if (Utils.checkName(this.myName, "自分の名前")) {
        this.peer = new Peer(this.myName, {
          key: this.$config.SKYWAY_API_KEY,
          debug: 3
        });
        this.peer.on("open", async () => {
          this.isConnecting = true;
          await this.setMyStream();
          if (this.role == Constants.ROLE_ROOM_CREATER) {
            // 作成者側
            this.joinRoom(this.myName);
          } else if (this.role == Constants.ROLE_ROOM_PARTICIPANT) {
            // 参加者側
            this.joinRoom(this.groupName);
          }
        });
      }
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
    joinRoom(roomName: string) {
      if (this.peer) {
        this.room = this.peer.joinRoom(roomName, {
          mode: "sfu",
          stream: this.localStream
        }) as SfuRoom;
        this.room.on("stream", (stream: RoomStream) => {
          this.streams.push(stream);
          setTimeout(() => {
            // 直後に実行するとエラーになるため0.5秒待つ
            const video = document.getElementById(
              `video_${this.streams.length}`
            ) as HTMLMediaElement;
            video.srcObject = stream;
            this.localStream = stream;
          }, 500);
        });
        this.room.on("peerLeave", (peerId: string) => {
          this.streams = this.streams.filter((stream: RoomStream) => {
            return stream.peerId !== peerId;
          });
        });
        this.room.on("close", () => {
          this.localStream = undefined;
          this.streams = [];
        });
      }
    },
    disconnect() {
      if (this.room) this.room.close();
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
  beforeDestroy() {
    this.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.select-role {
  width: 200px;
  margin: 0 auto;
}

.videos {
  width: 100%;
  > .video {
    width: 50%;

    &.small {
      width: 25%;
    }
  }
}
</style>