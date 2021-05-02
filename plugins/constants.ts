namespace Constants {
  // 役割
  export const ROLE_UNSELECT = 0;           // 未選択
  export const ROLE_CALLER = 1;             // 1:1　発信側
  export const ROLE_RECEIVER = 2;           // 1:1　着信側
  export const ROLE_ROOM_CREATER = 3;       // room　作成者
  export const ROLE_ROOM_PARTICIPANT = 4;   // room　参加者
  // 接続状態
  export const STATE_DISCONNECTED = 1;      // 未接続
  export const STATE_CONNECTED = 2;         // 接続中
}

export default Constants