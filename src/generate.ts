export function genFn() {
  let body = "";

  function add(str: string) {
    body += str + "\n";
    return add;
  }

  add.toString = () => { throw new Error("STUB"); };

  return add;
}
