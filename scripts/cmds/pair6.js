const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://raw.githubusercontent.com/Saim12678/Saim69/1a8068d7d28396dbecff28f422cb8bc9bf62d85f/font";

module.exports = {
  config: {
    name: "pair6",
    aliases: ["lovepair6", "match6"],
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤",
    version: "1.0",
    role: 0,
    category: "love",
    shortDescription: {
      en: "💘 Generate a love match under cherry blossoms with circular avatars"
    },
    longDescription: {
      en: "Calculates a love match between group members with custom cherry blossom background and elegantly positioned circular avatars."
    },
    guide: {
      en: "{p}{n} — Find a love match"
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
        return api.sendMessage("⚠️ Could not determine your gender.", event.threadID, event.messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
      } else {
        return api.sendMessage("⚠️ Your gender is undefined. Cannot find a match.", event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("❌ No suitable match found in the group.", event.threadID, event.messageID);
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

      const width = 736;
      const height = 414;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://i.imgur.com/4r1eplj.jpeg");
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
        ctx.strokeStyle = "#ffb7c5";
        ctx.stroke();
        ctx.restore();
      }

      // Protidhoni ba eker opor dujon character-er mathar upor ba pashe khub shundor vabe cricle duita set kora holo
      drawCircle(ctx, sIdImage, 180, 50, 100);
      drawCircle(ctx, pairPersonImage, 450, 50, 100);

      const outputPath = path.join(__dirname, "pair6_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;

        const message = `🌸 𝓒𝓱𝓮𝓻𝓻𝔂 𝓑𝓵𝓸𝓼𝓼𝓸𝓶 𝓛𝓸𝓿𝓮 🌸

🎀  ${senderName} ✨️
🎀  ${matchName} ✨️

🌸 𝓤𝓷𝓭𝓮𝓻 𝓽𝓱𝓮 𝓫𝓵𝓸𝓼𝓼𝓸𝓶𝓲𝓷𝓰 𝓫𝓻𝓪𝓷𝓬𝓱𝓮𝓼, 𝔂𝓸𝓾𝓻 𝓼𝓸𝓾𝓵𝓼 𝓪𝓻𝓮 𝓫𝓸𝓾𝓷𝓭 𝓽𝓸𝓰𝓮𝓽𝓱𝓮𝓻  🍡  

💘 𝙲𝚘𝚖𝚙𝚊𝚝𝚒𝚋𝚒𝚕𝚒𝚝𝚢: ${lovePercent}% 💘`;

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
        "❌ An error occurred while trying to find a match.\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};

