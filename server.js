const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();

// 設定靜態資源目錄
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  // 讀取 index.html 的內容
  const filePath = path.join(__dirname, "public", "static", "index.html");

  fs.readFile(filePath, function (err, data) {
    if (err) {
      // 如果讀取發生錯誤，輸出錯誤訊息到控制台
      console.error("Error reading index.html:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // 成功讀取，回傳 HTML 內容
      res.status(200).send(data);
    }
  });
});

const port = 3000;
const ip = "127.0.0.1";

app.listen(port, ip, function () {
  console.log(`Server is running at http://${ip}:${port}`);
});
