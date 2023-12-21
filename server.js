const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
var bodyParser = require('body-parser');

var db = new sqlite3.Database('db/test.db');
const app = express();

// db.each('SELECT * FROM student', function (err, row) {
//   if (err) return console.log(err.message);
//   console.log(row.ID + ':' + row.Name + " " + row.Subject);
// });
// db.close();
/////////////////////////////12/21練習的領域/////////////////////////////////////////
// SQL查詢學生有哪些課
const query = `
    SELECT Class.ID, Class.Name as ClassName
    FROM User
    JOIN StoC_relation ON User.ID = StoC_relation.UserID
    JOIN Class ON StoC_relation.ClassID = Class.ID
    WHERE User.Name = ?;
`;
// SQL查詢課的老師是誰
const query2 = `
    SELECT User.ID as TeacherID, User.Name as TeacherName, Class.Name as ClassName
    FROM Class
    JOIN User ON User.ID = Class.TeacherID
    WHERE Class.Name = ?;
`;
// SQL查詢老師有哪些課
const query3 = `
    SELECT User.ID as TeacherID, User.Name as TeacherName, Class.ID as ClassID, Class.Name as ClassName
    FROM User
    JOIN TtoC_relation ON User.ID = TtoC_relation.TeacherID
    JOIN Class ON TtoC_relation.ClassID = Class.ID
    WHERE User.Name = ?;
`;
//測試用
const targetUsername = '蔡明誠';
// 執行查詢
db.all(query3, targetUsername, (err, rows) => {
  if (err) {
    throw err;
  }

  // 處理查詢結果
  console.log(`Information about ${targetUsername} :`);
  rows.forEach(row => {
    //console.log(`Class ID: ${row.ID}, Class Name: ${row.ClassName}`);
    //console.log(`Teacher ID: ${row.TeacherID}, Teacher Name: ${row.TeacherName}, Class Name: ${row.ClassName}`);
    console.log(`Teacher ID: ${row.TeacherID}, Teacher Name: ${row.TeacherName}, Class ID: ${row.ClassID}, Class Name: ${row.ClassName}`);
  });


});
/////////////////////////////////////////////////////////////////////////////////////
// 設定靜態資源目錄
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/getclasses", function (req, res) {
  const ID = req.query.ID;
  const Name = req.query.Name;

  console.log("Received data:");
  console.log("ID:", ID);
  console.log("Name:", Name);

  console.log("xxxxxxxxxxxxxxxxxxx");

});

app.post("/postdata", function (req, res) {
  // 從 request body 中獲取 JSON 數據
  const data = req.body;

  console.log("Received data:");
  console.log(data);

  // 做其他處理或回傳回應
  res.status(200).json({ message: "Data received successfully", receivedData: data });
});


app.get("/", function (req, res) {
  // 讀取 index.html 的內容
  const filePath = path.join(__dirname, "public", "static", "index.html");

  fs.readFile(filePath, function (err, data) {
    if (err) {
      // 如果讀取發生錯誤，輸出錯誤訊息到控制台
      console.error("Error reading index.html:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // 成功讀取，回傳 HTML 內容
      res.set("Content-Type", "text/html");
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
      res.set("Content-Type", "text/html");
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
      res.set("Content-Type", "text/html");
      res.status(200).send(data);
    }
  });
});

const port = 8080;
const ip = "127.0.0.1";

app.listen(port, ip, function () {
  console.log(`Server is running at http://${ip}:${port}`);
});

