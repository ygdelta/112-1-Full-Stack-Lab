const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
var bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

var db = new sqlite3.Database('db/test.db');
const app = express();

function GenerateUserToken(userData) {
  const token = jwt.sign(userData, "secretKey", { expiresIn: "1h" });
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
db.all(query2, [target], (err, rows) => {
  if (err) {
    throw err;
  }

  // 處理查詢結果
  //console.log(`Information about ${target} :`);
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
  //console.log(`Update success: ${this.changes}`);

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
  //console.log(`Delete success: ${this.changes}`);
});


/////////////////////////////////////////////////////////////////////////////////////////////
// 設定靜態資源目錄
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.post("/getdiscuss",function(req,res){
//   var discuss_and_comments=`
//     SELECT Class.ID, Class.Name as ClassName, Class.TeacherID as TeacherName
//     FROM User
//     JOIN StoC_relation ON User.ID = StoC_relation.UserID
//     JOIN Class ON StoC_relation.ClassID = Class.ID
//     WHERE User.ID = ?;
//   `;


// });

app.post("/getclasses", function (req, res) {
  const ID = req.body.id;
  var find_class;
  //如果是學生身分 show 他修的課程 如果是老師 show他教的課程
  if(req.body.role=='Student'){
    find_class = `
    SELECT Class.ID, Class.Name as ClassName, Class.TeacherID as TeacherName
    FROM User
    JOIN StoC_relation ON User.ID = StoC_relation.UserID
    JOIN Class ON StoC_relation.ClassID = Class.ID
    WHERE User.ID = ?;
  `;
  }
  else if(req.body.role=='Teacher'){
    find_class = `
    SELECT Class.ID, Class.Name as ClassName
    FROM User
    JOIN TtoC_relation ON User.ID = TtoC_relation.TeacherID
    JOIN Class ON TtoC_relation.ClassID = Class.ID
    WHERE User.ID = ?;
  `;
  }

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

// app.post("/postdata", function (req, res) {
//   // 從 request body 中獲取 JSON 數據
//   const data = req.body;

//   console.log("Received data:");
//   console.log(data);

  // 做其他處理或回傳回應
//   res.status(200).json({ message: "Data received successfully", receivedData: data });
// });

app.post("/StudentLogin", function(req, res) {
  const queryParam = [req.body.Account, req.body.Password];
  const sql = `
  SELECT User.ID, User.Name, User.Role
  FROM User
  WHERE User.Role = 'Student' and User.Account = ? and User.Password = ?;
  `;

  db.all(sql, queryParam, function(err, rows) {
    if(rows.length == 0) 
      res.json({status: false, message: "帳號不存在或帳號密碼錯誤"});
    else if(rows.length == 1) {
      console.log(rows);
      console.log(GenerateUserToken(rows[0]));
      res.cookie("userData", GenerateUserToken(rows[0]), {maxAge: 3600000});
      res.json({status: true, message: "Success"});
    }
    else
      res.status(500).send("server error");
  });
});

app.post("/TeacherLogin", function(req, res) {
  const queryParam = [req.body.Account, req.body.Password];
  const sql = `
  SELECT User.ID, User.Name, User.Role
  FROM User
  WHERE User.Role = 'Teacher' and User.Account = ? and User.Password = ?;
  `;

  db.all(sql, queryParam, function(err, rows) {
    if(rows.length == 0) 
      res.json({status: false, message: "帳號不存在或帳號密碼錯誤"});
    else if(rows.length == 1) {
      console.log(rows);
      console.log(GenerateUserToken(rows[0]));
      res.cookie("userData", GenerateUserToken(rows[0]), {maxAge: 3600000});
      res.json({status: true, message: "Success"});
    }
    else
      res.status(500).send("server error");
  });
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

app.post("/StudentRegister", (req, res) => {
  const checkUser = `
  SELECT 1
  FROM User
  WHERE User.Role = 'Student' and User.Account = ?;
  `;
  const add_newuser=`
    INSERT INTO User(Role, Name, Account, Password)
    VALUES(?, ?, ?, ?)
  `;
  const Name = req.body.Name;
  const Account = req.body.Account;
  const Password = req.body.Password;
  db.all(checkUser, [Account], function(err, rows) {
    if(rows.length != 0) {
      res.status(200).json({status: false, error: "存在相同帳號"});
    }
    else {
      db.run(add_newuser, ['Student', Name, Account, Password], function(err) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
          return;
        }
        // 插入成功，回傳成功訊息
        res.json({ status: true, message: 'User registered successfully.' });
      });
    }
  });
});

app.post("/TeacherRegister", (req, res) => {
  const checkUser = `
  SELECT 1
  FROM User
  WHERE User.Role = 'Teacher' and User.Account = ?;
  `;
  const add_newuser=`
    INSERT INTO User(Role, Name, Account, Password)
    VALUES(?, ?, ?, ?)
  `;
  //var result = [];
  const Name = req.body.Name;
  const Account = req.body.Account;
  const Password = req.body.Password;
  //console.log(result);
  db.all(checkUser, [Account], function(err, rows) {
    if(rows.length != 0) {
      res.status(200).json({status: false, error: "存在相同帳號"});
    }
    else {
      db.run(addNewUserQuery, ['Teacher', Name, Account, Password], function(err) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
          return;
        }
        // 插入成功，回傳成功訊息
        res.json({ status: true, message: 'User registered successfully.' });
      });
    }
  });
});

/////////////////////////////////////學生加入課程/退出 

app.post("/StudentJoinClass", (req, res) => {
  const sjoinc=`
    INSERT INTO StoC_relation(UserID,ClassID)
    VALUES(?, ?)
  `;
  const selectClass = `
    SELECT ID, Name FROM Class WHERE ID = ?
  `;

  const studentID = req.body.UserID;
  const ClassID = req.body.ClassID;

  db.run(sjoinc, [studentID,ClassID], function(err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    db.get(selectClass, [ClassID], function (err, row) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      if (!row) {
        res.status(200).json({ status: false, error: "Class not found." });
        return;
      }

      // 回傳成功訊息及課程資訊
      res.json({
        status: true,
        data: {
          ID: row.ID,
          Name: row.Name,
        },
        message: 'Student Join successfully.',
      });
    });
  });
});

app.post("/StudentExitClass", (req, res) => {
  const sexitc=`
    DELETE FROM StoC_relation
    WHERE UserID=? AND ClassID=?
  `;

  const studentID = req.body.UserID;
  const ClassID = req.body.ClassID;

  db.run(sexitc, [studentID,ClassID], function(err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }
    // 插入成功，回傳成功訊息
    res.json({ status: true, message: 'Student Exit successfully.' });
  });

});

////////////////////////////////////////////老師創建課程/刪除
app.post("/TeacherCreateClass", (req, res) => {
  const classtab = `
    INSERT INTO Class(Name,TeacherID)
    VALUES(?, ?)
  `;
  const ttoc_class = `
    INSERT INTO TtoC_relation(TeacherID, ClassName)
    VALUES(?, ?)
  `;

  const selectClass = `
    SELECT ID, Name FROM Class WHERE ID = (SELECT last_insert_rowid())
  `;

  const ClassName = req.body.ClassName;
  const TeacherID = req.body.TeacherID;

  db.run(classtab, [ClassName, TeacherID], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    db.run(ttoc_class, [TeacherID, ClassName], function (err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      // 插入成功，查詢課程資訊
      db.get(selectClass, [], function (err, row) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
          return;
        }

        if (!row) {
          res.status(200).json({ status: false, error: "Class not found." });
          return;
        }

        // 回傳成功訊息及課程資訊
        res.json({
          status: true,
          data: {
            ID: row.ID,
            Name: row.Name,
          },
          message: 'Teacher connect Class successfully.',
        });
      });
    });
  });
});


app.post("/TeacherDeleteClass", (req, res) => {
  //記得加入確認該Class的TeacherID為目前登入身分的ID
  const classtab=`
    DELETE FROM Class
    WHERE ID=?
  `;
  const ttoc_class=`
    DELETE FROM TtoC_relation
    WHERE TeacherID=? AND ClassName =?
  `;

  const ClassID = req.body.ClassID;
  const TeacherID = req.body.UserID;
  const ClassName = req.body.ClassName;

  db.run(classtab, [ClassID], function(err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(ttoc_class, [TeacherID,ClassName], function(err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }
  
      // 插入成功，回傳成功訊息
      res.json({ status: true, message: 'Teacher delete Class successfully.' });
    });
  });
});
//////////////////////////////////////////新增討論串/刪除
app.post("/CreateDiscuss", (req, res) => {
  const dicusstab=`
    INSERT INTO Discuss(PublisherName,Context,Date)
    VALUES(?, ?, ?)
  `;
  const ctodis_class=`
    INSERT INTO CtoDis_relation(ClassID,DiscussID)
    VALUES(?, ?)
  `;

  const PublisherName = req.body.PublisherName;
  const Context = req.body.Context;
  const ClassID = req.body.ClassID;
  const Date = req.body.Date;


  db.run(dicusstab, [PublisherName,Context,Date], function(err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    const DiscussID = this.lastID;

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(ctodis_class, [ClassID,DiscussID], function(err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }
  
      // 插入成功，回傳成功訊息
      res.json({ status: true, message: 'discuss create successfully.' });
    });

  });

});

app.post("/DeleteDiscuss", (req, res) => {
  //記得加入確認該Class的TeacherID為目前登入身分的ID
  const discusstab=`
    DELETE FROM Discuss
    WHERE ID=?
  `;
  const ctodis_class=`
    DELETE FROM CtoDis_relation
    WHERE ClassID=? AND DiscussID =?
  `;

  const DiscussID = req.body.DiscussID;
  const ClassID = req.body.ClassID;

  db.run(discusstab, [DiscussID], function(err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(ttoc_class, [ClassID,DiscussID], function(err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }
  
      // 插入成功，回傳成功訊息
      res.json({ status: true, message: 'discuss delete successfully.' });
    });

  });

});

///////////////////////////////////////加入留言/刪除

app.post("/CreateComment", (req, res) => {
  const commenttab=`
    INSERT INTO Comments(PublisherName,Context,Date)
    VALUES(?, ?, ?)
  `;
  const distocom_class=`
    INSERT INTO DistoCom_relation(DisID,ComID)
    VALUES(?, ?)
  `;

  const PublisherName = req.body.PublisherName;
  const Context = req.body.Context;
  const DiscussID = req.body.ClassID;
  const Date=req.body.Date;


  db.run(commenttab, [PublisherName,Context,Date], function(err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    const comID = this.lastID;

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(distocom_class, [DiscussID,comID], function(err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }
  
      // 插入成功，回傳成功訊息
      res.json({ status: true, message: 'comment successfully.' });
    });

  });

});

app.post("/DeleteComment", (req, res) => {
  //記得加入確認該Class的TeacherID為目前登入身分的ID
  const commenttab=`
    DELETE FROM Discuss
    WHERE ID=?
  `;
  const distocom_class=`
    DELETE FROM CtoDis_relation
    WHERE ClassID=? AND DiscussID =?
  `;

  const DiscussID = req.body.DiscussID;
  const ClassID = req.body.ClassID;

  db.run(commenttab, [DiscussID], function(err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(distocom_class, [ClassID,DiscussID], function(err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }
  
      // 插入成功，回傳成功訊息
      res.json({ status: true, message: 'comment delete successfully.' });
    });

  });

});


const port = 8080;
const ip = "127.0.0.1";

app.listen(port, ip, function () {
  console.log(`Server is running at http://${ip}:${port}`);
});

