function calcMatch(word, base, insensitive=true) {
  insensitive = (insensitive) ? "i" : "";
  let matching = 0;
  let used = [];
  word.split("").forEach(c => {
    if (used.includes(c)) return;
    let m = base.match(new RegExp(c, "g" + insensitive));
    used.push(c);
    if (m === null) return;
    matching += m.length;
  });
  return matching / base.length;
}
