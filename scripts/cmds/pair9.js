const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://raw.githubusercontent.com/Saim12678/Saim69/1a8068d7d28396dbecff28f422cb8bc9bf62d85f/font";

module.exports = {
  config: {
    name: "pair9",
    aliases: ["lovepair9", "match9"],
    author: "𝔐𝔯.𝔎𝔦𝔫𝔤",
    version: "1.0",
    role: 0,
    category: "love",
    shortDescription: {
      en: "💘 Generate an elegant love match with left side vertical circular avatars"
    },
    longDescription: {
      en: "Calculates an elegant love match between group members with custom background and left-side vertical circular avatars."
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

      const width = 546;
      const height = 373;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://i.imgur.com/pUVpWbb.jpeg");
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
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        ctx.restore();
      }

      // Left side vertical stacked circular avatars
      drawCircle(ctx, sIdImage, 35, 40, 95);
      drawCircle(ctx, pairPersonImage, 35, 175, 95);

      const outputPath = path.join(__dirname, "pair9_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;

        const message = `✨ 𝗘𝗟𝗘𝗚𝗔𝗡𝗧 𝗟𝗢𝗩𝗘 𝗠𝗔𝗧𝗖𝗛 ✨\n\n🌸 ${senderName} 🤍\n🌸 ${matchName} 🤍\n\n⚔️ 𝗧𝘄𝗼 𝗵𝗲𝗮𝗿𝘁𝘀 𝗯𝗹𝗼𝘀𝘀𝗼𝗺𝗶𝗻𝗴 𝘁𝗼𝗴𝗲𝘁𝗵𝗲𝗿 𝗶𝗻 𝘁𝗵𝗲 𝗽𝘂𝗿𝗲𝘀𝘁 𝗴𝗮𝗿𝗱𝗲𝗻 𝗼𝗳 𝗱𝗲𝘀𝘁𝗶𝗻𝘆 🌸\n\n💘 𝗖𝗼𝗺𝗽𝗮𝘁𝗶𝗯𝗶𝗹𝗶𝘁𝘆: ${lovePercent}% 💘`;

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

