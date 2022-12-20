// unfinished!! TODO

const Transform = require("streams").Transform;

class Volume extends Transform {
  constructor(volume=1) {
    super();
    this.setVolume(volume);

    return this;
  }
  setVolume(v) {
    this.volume = v;

    // I have no idea what I'm doing here ._.
    // Refer to: https://github.com/reneraab/pcm-volume/blob/2aaaf05c2e1b69e7419af42ed45e1b6a4b191cce/index.js#L19
    this.multiplier = Math.tan(this.volume);
  }
  _transform(buf, _encoding, callback) {
    var out = new Buffer(buf.length);

  // Iterate the 16bit chunks
  for (i = 0; i < buf.length; i+=2) {
    // read Int16, multiply with volume multiplier and round down
    var uint = Math.floor(this.volume*buf.readInt16LE(i));

    // higher/lower values exceed 16bit
    uint = Math.min(32767, uint);
    uint = Math.max(-32767, uint);

    // write those 2 bytes into the other buffer
    out.writeInt16LE(uint, i);
  }

  // return the buffer with the changed values
  this.push(out);
  callback();
  }
}

module.exports = Volume;
