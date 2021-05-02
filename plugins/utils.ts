namespace Utils {
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
}

export default Utils