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
      <div class="content d-flex mb-6">
        <div class="video">
          <video ref="video" autoplay playsinline></video>
        </div>
        <div v-if="isConnecting" class="comment-area ml-4">
          <div class="head px-5 py-3">
            コメント
            <span class="arrow">▼</span>
          </div>
          <ul class="comment-list">
            <li
              class="comment py-1"
              v-for="comment in comments"
              :class="{ _mine: comment.isMine }"
              :key="comment.content"
            >
              <span class="name mr-2">{{ comment.name }}</span>
              <span class="content">{{ comment.content }}</span>
            </li>
          </ul>
          <div class="comment-form d-flex py-2">
            <div class="input d-flex align-center px-2">
              <input
                v-model="comment"
                type="text"
                placeholder="コメントを送信"
                maxlength="100"
                @keypress.enter="sendComment"
              />
            </div>
            <button class="send-btn py-1 mr-2" @click="sendComment">送信</button>
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
import Peer, { MediaConnection, RoomData } from "skyway-js";

type Data = {
  Constants: object;
  role: number;
  myName: string;
  streamName: string;
  state: number;
  isConnecting: boolean;
  peer: Peer | null;
  room: any;
  localStream: MediaStream | undefined;
  comment: string;
  comments: object[];
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
      localStream: undefined,
      comment: "",
      comments: []
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
          this.peer = new Peer(this.myName, {
            key: this.$config.SKYWAY_API_KEY,
            debug: 3
          });
          this.peer.on("open", async () => {
            await this.setMyStream();
            this.isConnecting = true;
            this.joinRoom(this.myName);
            this.onReceiveComment();
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
    setMyStream: async function() {
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
        this.onReceiveComment();
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
    },
    sendComment() {
      if (!this.comment) return;
      this.room.send(this.comment);
      const comment = {
        isMine: true,
        name: this.myName,
        content: this.comment
      };
      this.comments.push(comment);
      this.comment = "";
    },
    onReceiveComment() {
      this.room.on("data", ({ src, data }: RoomData) => {
        const comment = {
          isMine: false,
          name: src,
          content: data
        };
        this.comments.push(comment);
      });
    }
  },
  beforeDestroy() {
    this.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.comment-area {
  min-width: 340px;
  max-width: 340px;
  border: 1px solid $color-gray3;

  > .head {
    border-bottom: 1px solid $color-gray3;
    background: $color-gray1;

    > .arrow {
      vertical-align: middle;
      font-size: 10px;
    }
  }

  > .comment-list {
    min-height: 340px;
    max-height: 340px;
    overflow-y: auto;

    > .comment {
      > .name {
        color: $color-gray4;
      }

      &._mine {
        > .name {
          color: orange;
        }
      }
    }
  }

  > .comment-form {
    width: 100%;
    border-top: 1px solid $color-gray3;
    background: $color-gray1;

    > .input {
      width: 100%;
    }

    > .send-btn {
      min-width: 50px;
      text-align: center;
      color: $color-gray4;
      border: 1px solid $color-gray3;
      border-radius: 4px;
      background: $color-gray1;
      &:hover {
        filter: contrast(0.9);
      }
    }
  }
}
</style>