const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
var bodyParser = require('body-parser');

var db = new sqlite3.Database('db/test.db');
const app = express();

db.each('SELECT * FROM student', function(err, row) {
  if (err) return console.log(err.message);
  console.log(row.ID + ':' + row.Name+" "+ row.Subject);
});
db.close();

// 設定靜態資源目錄
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/getclasses", function(req, res) {
  const ID = req.query.ID;
  const Name = req.query.Name;

  console.log("Received data:");
  console.log("ID:", ID);
  console.log("Name:", Name);

  console.log("xxxxxxxxxxxxxxxxxxx");

});

app.post("/postdata", function(req, res) {
  // 從 request body 中獲取 JSON 數據
  const data = req.body;

  console.log("Received data:");
  console.log(data);

  // 做其他處理或回傳回應
  res.status(200).json({ message: "Data received successfully", receivedData: data });
});


app.get("/", function(req, res) {
  // 讀取 index.html 的內容
  const filePath = path.join(__dirname, "public", "static", "index.html");

  fs.readFile(filePath, function (err, data) {
    if (err) {
      // 如果讀取發生錯誤，輸出錯誤訊息到控制台
      console.error("Error reading index.html:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // 成功讀取，回傳 HTML 內容
      res.set("Content-Type","text/html");
      res.status(200).send(data);
    }
  });
});

//login button
app.get("/login", (req, res) => {
  const filePath = path.join(__dirname, "public", "static", "login.html");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Error reading button1.html:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.set("Content-Type","text/html");
      res.status(200).send(data);
    }
  });
});

//register button
app.get("/register", (req, res) => {
  const filePath = path.join(__dirname, "public", "static", "register.html");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Error reading button2.html:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.set("Content-Type","text/html");
      res.status(200).send(data);
    }
  });
});

const port = 8080;
const ip = "127.0.0.1";

app.listen(port, ip, function () {
  console.log(`Server is running at http://${ip}:${port}`);
});

