const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://raw.githubusercontent.com/Saim12678/Saim69/1a8068d7d28396dbecff28f422cb8bc9bf62d85f/font";

module.exports = {
  config: {
    name: "pair8",
    aliases: ["lovepair8", "match8"],
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤",
    version: "2.0",
    role: 0,
    category: "love",
    shortDescription: {
      en: "💘 Generate an upgraded love match with left side vertical circular avatars"
    },
    longDescription: {
      en: "Calculates an upgraded love match between group members with custom background and left-side vertical circular avatars."
    },
    guide: {
      en: "{p}{n} — Find an upgraded love match"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      let senderName = senderData.name;

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(user => user.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage("⚠️ Apanar gender khuje paoa jayni.", event.threadID, event.messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
      } else {
        return api.sendMessage("⚠️ Apanar gender define kora nei. Match khuje paoa sombhob na.", event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("❌ Group-e kono suitable match paoa jayni.", event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      let matchName = selectedMatch.name;

      let fontMap;
      try {
        const { data } = await axios.get(`${baseUrl}/21.json`);
        fontMap = data;
      } catch (e) {
        fontMap = {};
      }

      const convertFont = (text) =>
        text.split("").map(ch => fontMap[ch] || ch).join("");

      senderName = convertFont(senderName);
      matchName = convertFont(matchName);

      const width = 586;
      const height = 330;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://i.imgur.com/6BF4EVq.jpeg");
      ctx.drawImage(background, 0, 0, width, height);

      const sIdImage = await loadImage(`https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const pairPersonImage = await loadImage(`https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      function drawCircle(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#c8e6c9";
        ctx.stroke();
        ctx.restore();
      }

      // Left side vertical stacked circular avatars
      drawCircle(ctx, sIdImage, 30, 40, 95);
      drawCircle(ctx, pairPersonImage, 30, 160, 95);

      const outputPath = path.join(__dirname, "pair8_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;

        const message = `✨ 𝗘𝗡𝗘𝗡 𝗢𝗙 𝗘𝗧𝗘𝗥𝗡𝗔𝗟 𝗟𝗢𝗩𝗘 ✨

🌸 ${senderName} 🍃
🌸 ${matchName} 🍃

🌿 𝓘𝓷 𝓽𝓱𝓮 𝓺𝓾𝓲𝓮𝓽 𝔀𝓱𝓲𝓼𝓹𝓮𝓻𝓼 𝓸𝓯 𝓽𝓱𝓮 𝔀𝓲𝓷𝓭, 𝔂𝓸𝓾𝓻 𝓼𝓸𝓾𝓵𝓼 𝓪𝓻𝓮 𝔀𝓸𝓿𝓮𝓷 𝓽𝓸𝓰𝓮𝓽𝓱𝓮𝓻 𝓯𝓸𝓻𝓮𝓿𝓮𝓻 🍃

💖 Compatibility Level:** ${lovePercent}% 💖`;

        api.sendMessage(
          {
            body: message,
            attachment: fs.createReadStream(outputPath),
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (error) {
      api.sendMessage(
        "❌ Match tiri korar somoy ekta error hoyeche.\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};

