import Peer from "skyway-js";

namespace Utils {
  // 有効な名前かチェック
  export function checkName(name: string | null, alertNameString: string) {
    const regex = /^[0-9a-zA-Z]*$/;
    if (!name) {
      alert(`${alertNameString}を入力してください。`);
      return false;
    }
    if (!regex.test(name)) {
      alert(`${alertNameString}は半角英数字で入力してください。`);
      return false;
    }
    return true;
  }

  // 接続時エラーチェック
  export function checkPeer(peer: Peer, disconnect: Function) {
    peer.on("error", (error: ErrorEvent) => {
      if (error.type === "unavailable-id") {
        alert("現在その名前は既に使われています。");
      } else if (error.type === "peer-unavailable") {
        alert("相手が見つかりませんでした。");
      } else {
        alert("エラーが発生しました。");
      }
      disconnect();
    });
  }

  // 一番下までまでスクロール
  export function scrollToBottom(element: HTMLElement | null = null) {
    const bottom = document.documentElement.scrollHeight;
    if (element) {
      element.scrollTo({
        top: bottom,
        behavior: "smooth"
      });
    } else {
      window.scrollTo({
        top: bottom,
        behavior: "smooth"
      });
    }
  }
}

export default Utils