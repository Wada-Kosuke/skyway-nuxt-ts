<template>
  <div class="wrapper px-2 mx-auto">
    <div class="main">
      <SelectRole
        v-if="role === Constants.ROLE_UNSELECT"
        :role1="Constants.ROLE_ROOM_CREATER"
        :role2="Constants.ROLE_ROOM_PARTICIPANT"
        btnText1="配信を開始する"
        btnText2="視聴する"
        @set-role="setRole"
      ></SelectRole>
      <div v-else class="d-flex flex-column align-center mb-4">
        <div class="text-sm-body-2 text--secondary mb-2">半角英数字で入力してください。</div>
        <NameInput1 v-model="name1" head="あなたの名前" :isStarted="isStarted"></NameInput1>
        <NameInput2
          v-if="role === Constants.ROLE_ROOM_PARTICIPANT"
          v-model="name2"
          head="配信者名"
          :isStarted="isStarted"
        ></NameInput2>
        <v-btn outlined v-if="!isStarted" @click="connect" large>開始</v-btn>
        <v-btn v-else outlined @click="disconnect" large>切断</v-btn>
        <div
          v-if="role === Constants.ROLE_ROOM_PARTICIPANT && isStarted && state === Constants.STATE_DISCONNECTED"
          class="state mt-6 mb-3"
        >接続中…</div>
      </div>
      <div class="content d-flex flex-column flex-md-row align-md-center mb-6">
        <div v-if="isStarted" class="video">
          <video ref="video" :muted="role === Constants.ROLE_ROOM_CREATER" autoplay playsinline></video>
          <div v-if="state === Constants.STATE_CONNECTED" class="mt-2">現在の視聴者数：{{audienceNum}}人</div>
        </div>
        <div
          v-if="state === Constants.STATE_CONNECTED"
          class="comment-area my-4 mx-auto my-md-0 ml-md-4"
        >
          <div class="head px-5 py-3">
            コメント
            <span class="arrow">▼</span>
          </div>
          <ul class="comment-list" ref="commentList">
            <li
              class="comment py-1"
              v-for="comment in comments"
              :class="{ _mine: comment.isMine }"
              :key="comment.uuid"
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
import Peer, { RoomData, SfuRoom, RoomStream } from "skyway-js";
import { v4 as uuidv4 } from "uuid";

type Data = {
  Constants: object;
  role: number;
  name1: string;
  name2: string;
  state: number;
  isStarted: boolean;
  peer: Peer | null;
  room: SfuRoom | null;
  localStream: MediaStream | undefined;
  comment: string;
  comments: object[];
  audienceNum: number;
};

export default Vue.extend({
  data(): Data {
    return {
      Constants: Constants,
      role: Constants.ROLE_UNSELECT,
      name1: "",
      name2: "",
      state: Constants.STATE_DISCONNECTED,
      isStarted: false,
      peer: null,
      room: null,
      localStream: undefined,
      comment: "",
      comments: [],
      audienceNum: 0
    };
  },
  methods: {
    setRole(role: number) {
      this.role = role;
    },
    async connect() {
      if (!Utils.checkName(this.name1, "自分の名前")) return;
      this.peer = new Peer(this.name1, {
        key: this.$config.SKYWAY_API_KEY,
        debug: 3
      });
      Utils.checkPeer(this.peer, this.disconnect);
      this.peer.on("open", async () => {
        this.isStarted = true;
        if (this.role === Constants.ROLE_ROOM_CREATER) {
          // 配信者側
          await this.setMyStream();
          this.state = Constants.STATE_CONNECTED;
          this.joinRoom(this.name1);
          this.onReceiveComment();
        } else if (this.role === Constants.ROLE_ROOM_PARTICIPANT) {
          // 参加者側
          this.joinRoom(this.name2);
          if (this.room) this.playOtherStream(this.room);
        }
      });
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
    playOtherStream(room: SfuRoom) {
      room.on("stream", (stream: RoomStream) => {
        if (this.role === Constants.ROLE_ROOM_PARTICIPANT)
          this.state = Constants.STATE_CONNECTED;
        const video = this.$refs.video as HTMLMediaElement;
        video.srcObject = stream;
        this.onReceiveComment();
        this.state = Constants.STATE_CONNECTED;
      });
    },
    joinRoom: function(roomName: string) {
      if (this.peer) {
        this.room = this.peer.joinRoom(roomName, {
          mode: "sfu",
          stream: this.localStream
        }) as SfuRoom;
        this.updateAudienceNum(this.room);
        this.room.on("open", () => {
          if (this.room) this.updateAudienceNum(this.room);
        });
        this.room.on("peerJoin", () => {
          if (this.room) this.updateAudienceNum(this.room);
        });
        this.room.on("peerLeave", () => {
          if (this.room) this.updateAudienceNum(this.room);
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
      this.isStarted = false;
      this.state = Constants.STATE_DISCONNECTED;
    },
    sendComment() {
      if (!this.comment) return;
      if (this.room) this.room.send(this.comment);
      const comment = {
        uuid: uuidv4(), // :keyに使用
        isMine: true,
        name: this.name1,
        content: this.comment
      };
      this.comments.push(comment);
      this.comment = "";
      const commentList = this.$refs.commentList as HTMLElement;
      setTimeout(() => {
        Utils.scrollToBottom(commentList);
      }, 100);
    },
    onReceiveComment() {
      if (this.room) {
        this.room.on("data", ({ src, data }: RoomData) => {
          const comment = {
            uuid: uuidv4(),
            isMine: false,
            name: src,
            content: data
          };
          this.comments.push(comment);
          const commentList = this.$refs.commentList as HTMLElement;
          setTimeout(() => {
            Utils.scrollToBottom(commentList);
          }, 100);
        });
      }
    },
    updateAudienceNum(room: SfuRoom) {
      const name2 =
        this.role === Constants.ROLE_ROOM_CREATER ? this.name1 : this.name2;
      let audienceNum = room.members.filter(member => {
        return member !== name2;
      }).length;
      // room.membersに自分は含まれないので視聴者の場合+1
      if (this.role === Constants.ROLE_ROOM_PARTICIPANT) audienceNum++;
      this.audienceNum = audienceNum;
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