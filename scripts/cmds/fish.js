module.exports = {
  config: {
    name: "fish",
    version: "1.0.0",
    author: "Mr.king",
    countDown: 6,
    role: 0,
    shortDescription: "Go fishing and catch valuable sea creatures",
    category: "game",
    guide: "{pn}"
  },

  onStart: async function ({ api, message, event, usersData }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID) || {};
    const money = userData.money || 0;
    const name = userData.name || "User";

    const catches = [
      { name: "Small Fish", emoji: "🐟", reward: 2000, chance: 40 },
      { name: "Big Tuna", emoji: "🐠", reward: 6000, chance: 30 },
      { name: "Golden Shark", emoji: "🦈", reward: 15000, chance: 15 },
      { name: "Mystic Whale", emoji: "🐳", reward: 35000, chance: 10 },
      { name: "Ancient Treasure Chest", emoji: "👑", reward: 100000, chance: 5 }
    ];

    const rng = Math.random() * 100;
    let accumulated = 0;
    let caught = catches[0];

    for (const item of catches) {
      accumulated += item.chance;
      if (rng <= accumulated) {
        caught = item;
        break;
      }
    }

    const newMoney = money + caught.reward;
    await usersData.set(senderID, { money: newMoney });

    const msg = 
`F I S H I N G  G A M E
━━━━━━━━━━━━━━━━━━
Angler : ${name}
Catch : ${caught.emoji} ${caught.name}
Reward : +$${formatNumber(caught.reward)} added!
New Balance : $${formatNumber(newMoney)}
━━━━━━━━━━━━━━━━━━
Maintainer : Mr.king`;

    return message.reply(msg);
  }
};

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
       }
