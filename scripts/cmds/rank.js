const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BG_IMAGE_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpRWYIYVKn6YgF-RGtgS60H6VuPXu11qFQTV_D7SAUzGDY8mooWxFoDOxu&s=10";

module.exports = {
  config: {
    name: "rank",
    aliases: ["r", "level"],
    version: "2.1.0",
    author: "Mr.king",
    countDown: 3,
    role: 0,
    shortDescription: "Check user rank and message status card",
    category: "boxchat",
    guide: "{pn} [all / mention / reply]"
  },

  onStart: async function ({ api, message, event, args, usersData, threadsData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const mentions = event.mentions;
    const messageReply = event.messageReply;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);
    const imagePath = path.join(cacheDir, `rank_${Date.now()}.png`);

    try {
      const threadData = await threadsData.get(threadID) || {};
      const memberList = threadData.members || [];
      const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs || [];

      let allUsers = [];
      for (const member of memberList) {
        if (usersInGroup.includes(member.userID)) {
          allUsers.push({
            uid: member.userID,
            name: member.name || "Facebook User",
            count: member.count || 0
          });
        }
      }

      allUsers.sort((a, b) => b.count - a.count);

      if (args[0] && args[0].toLowerCase() === "all") {
        const topUsers = allUsers.slice(0, 15);
        let msg = `🎀\n`;
        topUsers.forEach((user, index) => {
          msg += `• ${user.name}\n• Baby your Rank ${index + 1} with ${user.count} messages\n\n`;
        });

        return message.reply(msg.trim());
      }

      let targetID = senderID;
      if (messageReply) {
        targetID = messageReply.senderID;
      } else if (mentions && Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      }

      let rank = 1;
      let userCount = 0;
      let targetName = "Facebook User";

      const targetIndex = allUsers.findIndex(u => u.uid == targetID);
      if (targetIndex !== -1) {
        rank = targetIndex + 1;
        userCount = allUsers[targetIndex].count;
        targetName = allUsers[targetIndex].name;
      } else {
        targetName = await usersData.getName(targetID) || "Facebook User";
      }

      const response = await axios.get(BG_IMAGE_URL, { responseType: "arraybuffer" });
      const bgImg = await loadImage(Buffer.from(response.data, "binary"));

      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(10, 10, 20, 0.70)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(40, 40, 920, 420, 25);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#00F0FF";
      ctx.font = "bold 42px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("🌸 ALIYA v4 USER RANK CARD", 80, 75);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 135);
      ctx.lineTo(920, 135);
      ctx.stroke();

      ctx.fillStyle = "#FFB6C1";
      ctx.font = "bold 34px Arial";
      const displayName = targetName.length > 28 ? targetName.substring(0, 28) + "..." : targetName;
      ctx.fillText(`👤 User : ${displayName}`, 80, 175);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 36px Arial";
      ctx.fillText(`🏆 Rank : #${rank}`, 80, 245);

      ctx.fillStyle = "#76BA1B";
      ctx.fillText(`💬 Messages : ${userCount}`, 80, 315);

      ctx.fillStyle = "#E0E0E0";
      ctx.font = "bold 24px Arial";
      ctx.fillText(`👑 Maintainer : Mr.king ☠️✌🏼`, 80, 395);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);

      const resultMsg = 
`🎀
• ${targetName}
• Baby your Rank ${rank} with ${userCount} messages`;

      await message.reply({
        body: resultMsg,
        attachment: fs.createReadStream(imagePath)
      });

    } catch (err) {
      console.error("Rank command error:", err);
      return message.reply("❌ Error generating rank card!");
    } finally {
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {}
      }
    }
  }
};
        
