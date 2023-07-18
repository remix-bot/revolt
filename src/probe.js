const ffprobe = require("ffprobe-static");

module.exports = (function(file) {
  return new Promise(res => {
    const options = "-hide_banner -show_entries format_tags:format=duration -print_format json -i " + file + "";

    const process = require("child_process").spawn(ffprobe.path, options.split(" "));
    const chunks = [];
    process.stderr.on("data", (d) => console.log(Buffer.from(d).toString()))
    process.stdout.on("data", (d) => {
      chunks.push(d);
    });
    process.stdout.on("end", () => {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      console.log(data);
      res({
        album: data.format?.tags?.album,
        artist: data.format?.tags?.artist,
        title: data.format?.tags?.title,
        duration: data.format.duration * 1000 // convert to ms
      });
    });
  });
})("https://autumn.revolt.chat/attachments/ukRo7fRggdeCTPIwzHNT1KotUH-7ARvV_Tu33GQjy7/Tim%20and%20Eric%20Universe%20Extanded%20Scenes_360p.mp4")
