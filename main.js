require("dotenv").config();
const PORT=process.env.PORT || 3000;
const LINE_CHANNEL_ACCESS_TOKEN=process.env.LINE_CHANNEL_ACCESS_TOKEN
const fetch=require("node-fetch");
const express=require("express");
const app=express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


const getNextLesson = require("./utils/getNextLesson");

// LINE Webhook
app.post("/webhook", async (req, res) => {
  const events = req?.body?.events;
  if (events.length > 0) {
    console.log(events[0].message);
    const messageText = events[0].message?.text;
    const replyToken = events[0].replyToken;

    if (messageText !== undefined) {
      if (
        messageText.indexOf("次") !== -1 &&
        messageText.indexOf("授業") !== -1
      ) {
        const now = new Date("2022-7-15 12:00:00");
        const lesson = getNextLesson(now);
        if (lesson !== null) {
          await replyMessage(`次の授業は、${lesson.name}です`, replyToken);
        } else {
          await replyMessage("次の授業はありません", replyToken);
        }
      } else {
        await replyMessage("すみません、よくわかりません", replyToken);
      }
    }
  }

  res.send("HTTP POST request sent to the webhook URL!");
});

app.get("/",(req,res)=>{
    res.send("Hello World");
});

app.listen(PORT, ()=>{
    console.log("Running at https://localhost:3000");
});


// 返信する関数
const replyMessage = async (text, replyToken) => {
  const message = {
    type: "text",
    text: text,
  };

  // LINEサーバーに送るデータ
  const postData = {
    replyToken: replyToken,
    messages: [message],
  };

  // LINEサーバーにデータを送信
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    body: JSON.stringify(postData),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
};

const spring1=require("./data/spring1.json");

app.get("/timetable",(req,res)=>{
    res.json(spring1);
});