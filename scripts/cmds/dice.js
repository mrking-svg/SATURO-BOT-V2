module.exports = {
  config: {
    name: "dice",
    version: "1.0.0",
    author: "Mr.king",
    countDown: 5,
    role: 0,
    shortDescription: "Play dice rolling game",
    category: "game",
    guide: "{pn} [amount] [1-6]"
  },

  onStart: async function ({ api, message, event, args, usersData }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID) || {};
    const money = userData.money || 0;
    const name = userData.name || "User";

    if (!args[0] || !args[1]) {
      return message.reply(
`Dice Game
━━━━━━━━━━━━━━━━━━
Baby, usage: dice [amount] [prediction number 1-6]
Example: dice 1M 4`
      );
    }

    const betAmount = parseSmartAmount(args[0]);
    const predictNumber = parseInt(args[1]);

    const maxBet = 20000000; // 20M limit
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply("Baby, enter a valid amount!");
    }
    if (betAmount > maxBet) {
      return message.reply(`Baby, the maximum dice limit is $${formatNumber(maxBet)}!`);
    }
    if (betAmount > money) {
      return message.reply(`Baby, you only have $${formatNumber(money)}!`);
    }
    if (isNaN(predictNumber) || predictNumber < 1 || predictNumber > 6) {
      return message.reply("Baby, please choose a prediction number between 1 and 6!");
    }

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    const rolledEmoji = diceEmojis[diceRoll - 1];

    let balanceChange = 0;
    let isWin = false;

    if (predictNumber === diceRoll) {
      isWin = true;
      balanceChange = betAmount * 5; // 5x payout for exact match
    } else {
      balanceChange = -betAmount;
    }

    await usersData.set(senderID, {
      money: money + balanceChange
    });

    const resultMessage = isWin ? 
`Dice Game Result
━━━━━━━━━━━━━━━━━━
User : ${name}
Rolled : ${rolledEmoji} (${diceRoll})
Prediction : ${predictNumber}
Status : WINNER!
Reward : Won $${formatNumber(betAmount * 5)} (5x)
━━━━━━━━━━━━━━━━━━
Maintainer : Mr.king` :
`Dice Game Result
━━━━━━━━━━━━━━━━━━
User : ${name}
Rolled : ${rolledEmoji} (${diceRoll})
Prediction : ${predictNumber}
Status : LOST!
Loss : -$${formatNumber(betAmount)}
━━━━━━━━━━━━━━━━━━
Maintainer : Mr.king`;

    return message.reply(resultMessage);
  }
};

function parseSmartAmount(str) {
  if (typeof str !== 'string') return parseFloat(str);
  const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
  const match = str.toLowerCase().match(/^(\d+(?:\.\d+)?)([kmbt]?)$/);
  if (!match) return parseFloat(str);
  return parseFloat(match[1]) * (units[match[2]] || 1);
}

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
  }
