const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

const BG_IMAGE_URL = "https://img.magnific.com/free-photo/anime-eyes-illustration_23-2151660535.jpg?semt=ais_hybrid&w=740&q=80";

module.exports = {
	config: {
		name: "daily",
		version: "2.0.0",
		author: "Mr.king",
		countDown: 5,
		role: 0,
		description: {
			vi: "Nhận quà hàng ngày",
			en: "Receive daily gift"
		},
		category: "game",
		guide: {
			vi: "   {pn}: Nhận quà hàng ngày"
				+ "\n   {pn} info: Xem thông tin quà hàng ngày",
			en: "   {pn}"
				+ "\n   {pn} info: View daily gift information"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 5000,
				exp: 200
			}
		}
	},

	langs: {
		vi: {
			monday: "Thu 2",
			tuesday: "Thu 3",
			wednesday: "Thu 4",
			thursday: "Thu 5",
			friday: "Thu 6",
			saturday: "Thu 7",
			sunday: "Chu nhat",
			alreadyReceived: "You have already received the gift today",
			received: "Daily Reward Successfully"
		},
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "You have already received the gift today",
			received: "Daily Reward Successfully"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;
		if (args[0] && args[0].toLowerCase() === "info") {
			let msg = "Daily Reward Info\n\n";
			for (let i = 1; i < 8; i++) {
				const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
				const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
				const day = i == 7 ? getLang("sunday") :
					i == 6 ? getLang("saturday") :
						i == 5 ? getLang("friday") :
							i == 4 ? getLang("thursday") :
								i == 3 ? getLang("wednesday") :
									i == 2 ? getLang("tuesday") :
										getLang("monday");
				msg += `${day}: ${getCoin} coin, ${getExp} exp\n`;
			}
			return message.reply(msg);
		}

		const dateTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
		const date = new Date();
		const currentDay = date.getDay();
		const { senderID } = event;

		const userData = await usersData.get(senderID) || {};
		if (!userData.data) userData.data = {};
		if (userData.data.lastTimeGetReward === dateTime)
			return message.reply(getLang("alreadyReceived"));

		const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
		const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
		
		userData.data.lastTimeGetReward = dateTime;
		await usersData.set(senderID, {
			money: (userData.money || 0) + getCoin,
			exp: (userData.exp || 0) + getExp,
			data: userData.data
		});

		const userName = userData.name || "User";

		const cacheDir = path.join(__dirname, "cache");
		fs.ensureDirSync(cacheDir);
		const imagePath = path.join(cacheDir, `daily_${Date.now()}.png`);

		try {
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
			ctx.fillText("ALIYA V4 DAILY REWARD", 80, 75);

			ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(80, 135);
			ctx.lineTo(920, 135);
			ctx.stroke();

			ctx.fillStyle = "#FFB6C1";
			ctx.font = "bold 34px Arial";
			const displayName = userName.length > 28 ? userName.substring(0, 28) + "..." : userName;
			ctx.fillText(`User : ${displayName}`, 80, 175);

			ctx.fillStyle = "#FFFFFF";
			ctx.font = "bold 34px Arial";
			ctx.fillText(`Coin : ${getCoin}`, 80, 245);

			ctx.fillStyle = "#76BA1B";
			ctx.fillText(`Exp : ${getExp}`, 80, 315);

			ctx.fillStyle = "#E0E0E0";
			ctx.font = "bold 24px Arial";
			ctx.fillText(`Maintainer : Mr.king`, 80, 395);

			const buffer = canvas.toBuffer("image/png");
			fs.writeFileSync(imagePath, buffer);

			const textResult = 
`Daily Reward Successfully
User : ${userName}
Coin : ${getCoin}
Exp : ${getExp}`;

			await message.reply({
				body: textResult,
				attachment: fs.createReadStream(imagePath)
			});

		} catch (err) {
			console.error("Daily reward card error:", err);
			return message.reply(`Daily Reward Successfully\nYou have received ${getCoin} coin and ${getExp} exp`);
		} finally {
			if (fs.existsSync(imagePath)) {
				try {
					fs.unlinkSync(imagePath);
				} catch (e) {}
			}
		}
	}
};
			
