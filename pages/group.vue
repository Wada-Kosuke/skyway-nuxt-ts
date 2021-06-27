<template>
  <div class="wrapper px-2 mx-auto">
    <div class="main">
      <div class="d-flex flex-column align-center mb-4">
        <div class="text-sm-body-2 text--secondary mb-2">半角英数字で入力してください。</div>
        <div
          class="name d-flex flex-column flex-md-row justify-center align-start align-md-center mb-4"
        >
          <div class="head mr-1">グループ名：</div>
          <div class="input">
            <input v-model="groupName" :disabled="isStarted" type="text" />
          </div>
        </div>
        <v-btn outlined v-if="!isStarted" @click="connect" large>開始</v-btn>
        <v-btn v-else outlined @click="disconnect" large>切断</v-btn>
      </div>
      <div class="content mb-6">
        <div v-if="isStarted" class="videos d-flex flex-wrap">
          <div class="video pa-2">
            <video ref="myVideo" muted autoplay playsinline></video>
          </div>
          <div
            v-for="(stream, index) in streams"
            :key="stream.id"
            class="video pa-2"
            :class="{md_small: streams.length >= 5}"
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
import { v4 as uuidv4 } from "uuid";

type Data = {
  Constants: object;
  groupName: string;
  state: number;
  isStarted: boolean;
  peer: Peer | null;
  room: SfuRoom | null;
  localStream: MediaStream | undefined;
  streams: RoomStream[];
};

export default Vue.extend({
  data(): Data {
    return {
      Constants: Constants,
      groupName: "",
      state: Constants.STATE_DISCONNECTED,
      isStarted: false,
      peer: null,
      room: null,
      localStream: undefined,
      streams: []
    };
  },
  methods: {
    async connect() {
      if (Utils.checkName(this.groupName, "グループ名")) {
        const uuid = uuidv4();
        this.peer = new Peer(uuid, {
          key: this.$config.SKYWAY_API_KEY,
          debug: 3
        });
        Utils.checkPeer(this.peer, this.disconnect);
        this.peer.on("open", async () => {
          this.isStarted = true;
          await this.setMyStream();
          this.joinRoom(this.groupName);
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
        this.room = this.peer.joinRoom("group_" + roomName, {
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
      this.isStarted = false;
      this.state = Constants.STATE_DISCONNECTED;
    }
  },
  beforeDestroy() {
    this.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.videos {
  width: 100%;
  > .video {
    width: 50%;

    > video {
      max-height: 40vh;
    }

    &.md_small {
      @media screen and (min-width: $md) {
        width: 25%;
      }
    }
  }
}
</style>