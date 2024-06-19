require("dotenv").config();
const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(cors());

const webAppUrl = "https://tg-react.netlify.app";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, `Fill the form, please`, {
      reply_markup: {
        keyboard: [
          [{ text: "Fill the form", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });

    await bot.sendMessage(chatId, `Visit our store by click the button below`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Make an order", web_app: { url: webAppUrl } }],
        ],
      },
    });
  }

  // receiving data via "SendData" method of the MainButton on UI
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(chatId, `Thanks!`);
      await bot.sendMessage(chatId, `Your country is ${data?.country}`);
      await bot.sendMessage(chatId, `Your street is ${data?.street}`);

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          `All required info you'll get in this chat`
        );
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, products = [], totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успешная покупка",
      input_message_content: {
        message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products
          .map((item) => item.title)
          .join(", ")}`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    return res.status(500).json({});
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`server started on PORT ${PORT}`);
});
