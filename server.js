const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
var bodyParser = require('body-parser');
//const jwt = require("jsonwebtoken");

var db = new sqlite3.Database('db/test.db');
const app = express();


function generateUserToken(username) {
  // 在這裡可以加入更多有關用戶的信息
  const userInfo = {
    username: username,
    // 可以加入用戶的 ID 等其他信息
  };

  // 生成 token
  const token = jwt.sign(userInfo, "your_secret_key", { expiresIn: "1h" });

  return token;
}

// db.each('SELECT * FROM student', function (err, row) {
//   if (err) return console.log(err.message);
//   console.log(row.ID + ':' + row.Name + " " + row.Subject);
// });
// db.close();
/////////////////////////////12/21練習的領域(查詢)/////////////////////////////////////////
// SQL查詢學生有哪些課

// SQL查詢課的老師是誰
const query2 = `
    SELECT User.ID as TeacherID, User.Name as TeacherName, Class.Name as ClassName
    FROM Class
    JOIN User ON User.ID = Class.TeacherID
    WHERE Class.Name = ?;
`;

const find_account=`
    SELECT User.Account
    FROM User
    WHERE User.Account = ?;
`;
//測試用
const target = '蔡明誠';
// 執行查詢
db.all(query3, [target], (err, rows) => {
  if (err) {
    throw err;
  }

  // 處理查詢結果
  console.log(`Information about ${target} :`);
  rows.forEach(row => {
    //console.log(`Class ID: ${row.ID}, Class Name: ${row.ClassName}`);
    //console.log(`Teacher ID: ${row.TeacherID}, Teacher Name: ${row.TeacherName}, Class Name: ${row.ClassName}`);
    console.log(`Teacher ID: ${row.TeacherID}, Teacher Name: ${row.TeacherName}, Class ID: ${row.ClassID}, Class Name: ${row.ClassName}`);
  });


});
////////////////////////////////資料庫修改/////////////////////////////////////////////////////
const userIdToUpdate = 2;
const newName = '楊小煜';
const updateQuery = `
    UPDATE User
    SET Name = ?
    WHERE ID = ?;
`;
db.run(updateQuery, [newName, userIdToUpdate], function (err) {
  if (err) {
    throw err;
  }

  // 這裡的 this.lastID 是最後一次插入的行的ID，這裡是更新，所以通常為更新的行數
  console.log(`Update success: ${this.changes}`);

});
////////////////////////////////資料庫刪除/////////////////////////////////////////////////////
const classIdToDelete = 4;
const deleteQuery = `
    DELETE FROM Class
    WHERE ID = ?;
`;

// 執行刪除語句
db.run(deleteQuery, [classIdToDelete], function (err) {
  if (err) {
    throw err;
  }

  // 這裡的 this.changes 是受影響的行數，通常為刪除的行數
  console.log(`Delete success: ${this.changes}`);
});


/////////////////////////////////////////////////////////////////////////////////////////////
// 設定靜態資源目錄
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/getclasses", function (req, res) {
  const ID = req.body.id;
  //const Role = req.body.role;
  if(req.body.role=='Student'){
    const find_class = `
    SELECT Class.ID, Class.Name as ClassName, Class.TeacherID as TeacherName
    FROM User
    JOIN StoC_relation ON User.ID = StoC_relation.UserID
    JOIN Class ON StoC_relation.ClassID = Class.ID
    WHERE User.ID = ?;
  `;
  }
  else if( req.body.role=='Teacher'){
    // SQL查詢老師有哪些課
    const find_class = `
    SELECT User.ID as TeacherID, User.Name as TeacherName, Class.ID as ClassID, Class.Name as ClassName
    FROM User
    JOIN TtoC_relation ON User.ID = TtoC_relation.TeacherID
    JOIN Class ON TtoC_relation.ClassID = Class.ID
    WHERE User.ID = ?;
`;
  }

  //console.log(req);
  //const target = ID;
  var result = [];
  db.all(find_class, [ID], (err, rows) => {
    if (err) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          status: false,
          data: result
        }));
      throw err;
    }
  
    // 處理查詢結果
    console.log(`Information about User_id=${ID} :`);
    rows.forEach(row => {
      console.log(`Class ID: ${row.ID}, Class Name: ${row.ClassName}`);
      result.push({
        ID: row.ID, 
        Name: row.ClassName
      });
    });   

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: true,
      data: result
    }));
  });
  //console.log("xxxxxxxxxxxxxxxxxxx");
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

app.post("/studentRegister", (req, res) => {
  const add_newuser=`
    INSERT INTO User(Role, Name, Account, Password)
    VALUES(?, ?, ?, ?)
  `;
  //var result = [];
  const Name = req.body.Name;
  const Account = req.body.Account;
  const Password = req.body.Password;
  //console.log(result);
  db.run(add_newuser, ['Student', Name, Account, Password], function(err) {
    if (err) {
      res.status(500).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    res.json({ status: true, message: 'User registered successfully.' });
  });

});

app.post("/teacherRegister", (req, res) => {
  const add_newuser=`
    INSERT INTO User(Role, Name, Account, Password)
    VALUES(?, ?, ?, ?)
  `;
  //var result = [];
  const Name = req.body.Name;
  const Account = req.body.Account;
  const Password = req.body.Password;
  //console.log(result);
  db.run(addNewUserQuery, ['Teacher', Name, Account, Password], function(err) {
    if (err) {
      res.status(500).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    res.json({ status: true, message: 'User registered successfully.' });
  });

});

const port = 8080;
const ip = "127.0.0.1";

app.listen(port, ip, function () {
  console.log(`Server is running at http://${ip}:${port}`);
});

