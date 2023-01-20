const puppeteer = require("puppeteer");
const https = require("https");
const EventEmitter = require("events");

class Tuna extends EventEmitter {
  ready = false

  constructor() {
    super();
  }
  launch() {
    return new Promise(async (r) => {
      this.browser = await puppeteer.launch({ headless: true });
      this.ready = true;
      this.emit("ready");
      r();
    });
  }
  close() {
    return new Promise(async r => {
      // TODO: close all pages;
      await this.browser.close();
      this.ready = false;
      this.emit("end");
      r();
    })
  }
  search(query, resPos=0) {
    return new Promise(async res => {
      if (!this.ready) {
        console.warn("Unable to fetch data before ready!");
        return res(null);
      }
      resPos++;
      const url = "https://tuna.voicemod.net/search/sounds" + ((query) ? "?search=" + encodeURIComponent(query) : "");
      const page = await this.browser.newPage();
      await page.goto(url);
      await page.waitForSelector(".cookie-consent");
      await page.$eval(".cookie-consent", e => e.remove());

      await page.waitForSelector(".search-results");

      const selector = ".search-results > div:nth-child(" + resPos + ")";
      await Promise.all([ page.waitForNetworkIdle(), page.hover(selector)]);

      const data = await page.$eval(selector, (e) => {
        let audio = e.querySelector("audio");
        return {
          audio: audio.src,
          thumbnail: e.querySelector("img").src,
          author: e.querySelector("div[class*='username']").children[1].textContent.trim(),
          title: e.querySelector("div[class*='title']").children[0].textContent.trim(),
          url: "https://tuna.voicemod.net/sound/" + audio.id,
          id: audio.id
        }
      });
      await page.close();
      res(data);
    });
  }
  listSearch(query) {
    return new Promise(async res => {
      if (!this.ready) {
        console.warn("Unable to fetch data before ready!");
        return res(null);
      }
      const url = "https://tuna.voicemod.net/search/sounds" + ((query) ? "?search=" + encodeURIComponent(query) : "");
      const page = await this.browser.newPage();
      await page.goto(url);
      await page.waitForSelector(".cookie-consent");
      await page.$eval(".cookie-consent", e => e.remove());

      await page.waitForSelector(".search-results");

      const selector = ".search-results > div";

      const data = await page.$$eval(selector, (els) => {
        return els.map(e => {
          let audio = e.querySelector("audio");
          return {
            thumbnail: e.querySelector("img").src,
            author: e.querySelector("div[class*='username']").children[1].textContent.trim(),
            title: e.querySelector("div[class*='title']").children[0].textContent.trim(),
            url: "https://tuna.voicemod.net/sound/" + audio.id,
            id: audio.id
          }
        });
      });
      await page.close();
      res(data);
    });
  }
  loadSound(id) {
    return new Promise(async res => {
      if (!this.ready) {
        console.warn("Unable to fetch data before ready!");
        return res(null);
      }
      const url = "https://tuna.voicemod.net/sound/" + id;
      const page = await this.browser.newPage();
      await page.goto(url);
      await page.waitForSelector(".cookie-consent");
      await page.$eval(".cookie-consent", e => e.remove());

      const selector = "div.sound__grid";
      await page.waitForSelector(selector);

      await Promise.all([ page.waitForNetworkIdle(), page.hover("div[class*='audio']")]);

      const data = await page.$eval(selector, (e) => {
        let audio = e.querySelector("audio");
        let a = e.querySelector("div[class*='user-name-link']>a");
        return {
          audio: audio.src,
          thumbnail: e.querySelector("img").src,
          author: {
            url: a.href,
            name: a.textContent.trim()
          },
          title: e.querySelector("h1[class*='title']").textContent.trim().replace("- Meme Sound Effect Button for Soundboard", "").trim(),
          url: "https://tuna.voicemod.net/sound/" + audio.id,
          id: audio.id
        }
      });
      await page.close();
      res(data);
    });
  }

  downloadSound(url) {
    return new Promise(res => {
      https.get(url, (result) => {
        res(result);
      });
    });
  }
}

module.exports = Tuna;
