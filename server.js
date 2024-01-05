const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
var bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

var db = new sqlite3.Database('db/test.db');
const app = express();
//app.use(express.json());

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

const find_account = `
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
  if (req.body.role == 'Student') {
    find_class = `
    SELECT Class.ID, Class.Name as ClassName, Class.TeacherID as TeacherName
    FROM User
    JOIN Student_to_Class_relation ON User.ID = Student_to_Class_relation.UserID
    JOIN Class ON Student_to_Class_relation.ClassID = Class.ID
    WHERE User.ID = ?;
  `;
  }
  else if (req.body.role == 'Teacher') {
    find_class = `
    SELECT Class.ID, Class.Name as ClassName
    FROM User
    JOIN Teacher_to_Class_relation ON User.ID = Teacher_to_Class_relation.TeacherID
    JOIN Class ON Teacher_to_Class_relation.ClassID = Class.ID
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

app.post("/StudentLogin", function (req, res) {
  const queryParam = [req.body.Account, req.body.Password];
  const sql = `
  SELECT User.ID, User.Name, User.Role
  FROM User
  WHERE User.Role = 'Student' and User.Account = ? and User.Password = ?;
  `;

  db.all(sql, queryParam, function (err, rows) {
    if (rows.length == 0)
      res.json({ status: false, message: "帳號不存在或帳號密碼錯誤" });
    else if (rows.length == 1) {
      console.log(rows);
      console.log(GenerateUserToken(rows[0]));
      res.cookie("userData", GenerateUserToken(rows[0]), { maxAge: 3600000 });
      res.json({ status: true, message: "Success" });
    }
    else
      res.status(500).send("server error");
  });
});

app.post("/TeacherLogin", function (req, res) {
  const queryParam = [req.body.Account, req.body.Password];
  const sql = `
  SELECT User.ID, User.Name, User.Role
  FROM User
  WHERE User.Role = 'Teacher' and User.Account = ? and User.Password = ?;
  `;

  db.all(sql, queryParam, function (err, rows) {
    if (rows.length == 0)
      res.json({ status: false, message: "帳號不存在或帳號密碼錯誤" });
    else if (rows.length == 1) {
      console.log(rows);
      console.log(GenerateUserToken(rows[0]));
      res.cookie("userData", GenerateUserToken(rows[0]), { maxAge: 3600000 });
      res.json({ status: true, message: "Success" });
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
  const add_newuser = `
    INSERT INTO User(Role, Name, Account, Password)
    VALUES(?, ?, ?, ?)
  `;
  const Name = req.body.Name;
  const Account = req.body.Account;
  const Password = req.body.Password;
  db.all(checkUser, [Account], function (err, rows) {
    if (rows.length != 0) {
      res.status(200).json({ status: false, error: "存在相同帳號" });
    }
    else {
      db.run(add_newuser, ['Student', Name, Account, Password], function (err) {
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
  const add_newuser = `
    INSERT INTO User(Role, Name, Account, Password)
    VALUES(?, ?, ?, ?)
  `;
  //var result = [];
  const Name = req.body.Name;
  const Account = req.body.Account;
  const Password = req.body.Password;
  //console.log(result);
  db.all(checkUser, [Account], function (err, rows) {
    if (rows.length != 0) {
      res.status(200).json({ status: false, error: "存在相同帳號" });
    }
    else {
      db.run(add_newuser, ['Teacher', Name, Account, Password], function (err) {
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
  const student_join_class = `
    INSERT INTO Student_to_Class_relation(UserID,ClassID)
    VALUES(?, ?)
  `;
  const selectClass = `
    SELECT ID, Name FROM Class WHERE ID = ?
  `;
  const checkExistingEntry = `
    SELECT COUNT(*) AS count FROM Student_to_Class_relation
    WHERE UserID = ? AND ClassID = ?
  `;

  const studentID = req.body.UserID;
  const ClassID = req.body.ClassID;

  // Check if the entry already exists
  db.get(checkExistingEntry, [studentID, ClassID], function (err, existingRow) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    if (existingRow && existingRow.count > 0) {
      // Entry already exists, return an appropriate response
      res.status(200).json({ status: false, error: "Student is already part of the class." });
      return;
    }

    // Entry does not exist, proceed with insertion
    db.run(student_join_class, [studentID, ClassID], function (err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      // Insertion successful, retrieve class information
      db.get(selectClass, [ClassID], function (err, row) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
          return;
        }

        if (!row) {
          res.status(200).json({ status: false, error: "Class not found." });
          return;
        }

        // Return success message and class information
        res.json({
          status: true,
          data: {
            ID: row.ID,
            Name: row.Name,
          },
          message: 'Student joined the class successfully.',
        });
      });
    });
  });
});


app.post("/StudentExitClass", (req, res) => {
  const student_exit_class = `
    DELETE FROM Student_to_Class_relation
    WHERE UserID=? AND ClassID=?
  `;

  const studentID = req.body.UserID;
  const ClassID = req.body.ClassID;

  db.run(student_exit_class, [studentID, ClassID], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }
    // 插入成功，回傳成功訊息
    res.json({ status: true, message: 'Student Exit class successfully.' });
  });

});

////////////////////////////////////////////老師對課程的創建/刪除
app.post("/TeacherCreateClass", (req, res) => {
  const classtab = `
    INSERT INTO Class(Name,TeacherID)
    VALUES(?, ?)
  `;
  const teacher_to_class = `
    INSERT INTO Teacher_to_Class_relation(TeacherID, ClassID)
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
    db.get(selectClass, [], function (err, row) {
      console.log(row);
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      if (!row) {
        res.status(200).json({ status: false, error: "Class not found." });
        return;
      }

      // 插入成功，回傳成功訊息
      db.run(teacher_to_class, [TeacherID, row.ID], function (err) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
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

app.post("/TeacherChangeClassName", (req, res) => {
  const updateClassName = `
    UPDATE Class
    SET Name = ?
    WHERE ID = ?
  `;

  const selectClass = `
    SELECT ID, Name, TeacherID FROM Class WHERE ID = ?
  `;

  const ClassID = req.body.ClassID;
  const NewClassName = req.body.ClassName;

  // 確認收到ClassID跟ClassName
  if (!ClassID || !NewClassName) {
    res.status(400).json({ status: false, error: "ClassID and NewClassName are required." });
    return;
  }

  // 更新資料
  db.run(updateClassName, [NewClassName, ClassID], function (err) {
    if (err) {
      res.status(500).json({ status: false, error: err.message });
      return;
    }

    db.get(selectClass, [ClassID], function (err, row) {
      if (err) {
        res.status(500).json({ status: false, error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ status: false, error: "Class not found." });
        return;
      }

      //回傳成功訊息
      res.json({
        status: true,
        data: {
          ID: row.ID,
          Name: row.Name,
          TeacherID: row.TeacherID,
        },
        message: 'Class name updated successfully.',
      });
    });
  });
});



app.post("/TeacherDeleteClass", (req, res) => {
  const ClassID = req.body.ClassID;
  const TeacherID = req.body.UserID;

  // 先確認該Class的TeacherID為目前登入身分的ID
  const checkTeacherQuery = `
    SELECT COUNT(*) AS count FROM Class
    WHERE ID = ? AND TeacherID = ?
  `;

  // 刪除Class
  const deleteClassQuery = `
    DELETE FROM Class
    WHERE ID = ?
  `;

  // 刪除該Class中的Chapter
  const deleteChaptersQuery = `
    DELETE FROM Chapter
    WHERE ClassID = ?
  `;

  // 刪除每個Chapter中的Section
  const deleteSectionsQuery = `
    DELETE FROM Section
    WHERE ID IN (
      SELECT Section.ID
      FROM Section
      JOIN Chapter_to_Section_relation ON Section.ID = Chapter_to_Section_relation.SectionID
      JOIN Chapter ON Chapter_to_Section_relation.ChapterID = Chapter.ID
      WHERE Chapter.ClassID = ?
    )
  `;

  // 刪除該Class和Teacher的關聯
  const deleteTeacherClassRelationQuery = `
    DELETE FROM Teacher_to_Class_relation
    WHERE TeacherID = ? AND ClassID = ?
  `;

  // 檢查TeacherID是否為該Class的擁有者
  db.get(checkTeacherQuery, [ClassID, TeacherID], (err, result) => {
    if (err) {
      res.status(500).json({ status: false, error: err.message });
      return;
    }

    if (result.count === 0) {
      res.status(403).json({ status: false, error: "Teacher does not own this class." });
      return;
    }

    // 開始執行刪除操作
    db.run(deleteSectionsQuery, [ClassID], (err) => {
      if (err) {
        res.status(500).json({ status: false, error: err.message });
        return;
      }

      db.run(deleteChaptersQuery, [ClassID], (err) => {
        if (err) {
          res.status(500).json({ status: false, error: err.message });
          return;
        }

        db.run(deleteClassQuery, [ClassID], (err) => {
          if (err) {
            res.status(500).json({ status: false, error: err.message });
            return;
          }

          db.run(deleteTeacherClassRelationQuery, [TeacherID, ClassID], (err) => {
            if (err) {
              res.status(500).json({ status: false, error: err.message });
              return;
            }

            res.json({ status: true, message: 'Teacher deleted the class and associated content successfully.' });
          });
        });
      });
    });
  });
});


////////////////////////////////////////////老師在課程中章節的創建/刪除
app.post("/TeacherCreateChapter", (req, res) => {
  const chaptertab = `
    INSERT INTO Chapter(Name,ClassID)
    VALUES(?, ?)
  `;
  const class_to_chapter = `
    INSERT INTO Class_to_Chapter_relation(ClassID, ChapterID)
    VALUES(?, ?)
  `;

  const selectChapter = `
    SELECT ID, Name FROM Chapter WHERE ID = (SELECT last_insert_rowid())
  `;

  const ChapterName = req.body.ChapterName;
  const ClassID = req.body.ClassID;

  db.run(chaptertab, [ChapterName, ClassID], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    db.get(selectChapter, [], function (err, row) {
      console.log(row);
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      if (!row) {
        res.status(200).json({ status: false, error: "Chapter not found." });
        return;
      }

      // 插入成功，回傳成功訊息
      db.run(class_to_chapter, [ClassID, row.ID], function (err) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
          return;
        }

        // 回傳成功訊息及課程資訊
        res.json({
          status: true,
          data: {
            ID: row.ID,
            Name: row.Name,
          },
          message: 'class create and connect Chapter successfully.',
        });
      });
    });
  });
});

app.post("/TeacherChangeChapterName", (req, res) => {
  const updateChapterName = `
    UPDATE Chapter
    SET Name = ?
    WHERE ID = ?
  `;

  const selectChapter = `
    SELECT ID, Name, ClassID FROM Chapter
    WHERE ID = ?
  `;

  const ChapterID = req.body.ChapterID;
  const NewChapterName = req.body.ChapterName;

  // 檢查傳入資料是否完整
  if (!ChapterID || !NewChapterName) {
    res.status(400).json({ status: false, error: "ChapterID and NewChapterName are required." });
    return;
  }

  // 更新chapter名稱
  db.run(updateChapterName, [NewChapterName, ChapterID], function (err) {
    if (err) {
      res.status(500).json({ status: false, error: err.message });
      return;
    }


    db.get(selectChapter, [ChapterID], function (err, row) {
      if (err) {
        res.status(500).json({ status: false, error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ status: false, error: "Chapter not found for the specified ChapterID." });
        return;
      }

      // 回傳訊息
      res.json({
        status: true,
        data: {
          ID: row.ID,
          Name: row.Name,
          ClassID: row.ClassID,
        },
        message: 'Chapter name updated successfully.',
      });
    });
  });
});


app.post("/TeacherDeleteChapter", (req, res) => {
  const ChapterID = req.body.ChapterID;
  const ClassID = req.body.ClassID;

  // 刪除Chapter_to_Section_relation中該ChapterID對應的所有SectionID
  const deleteChapterSectionsQuery = `
    DELETE FROM Section
    WHERE ID IN (
      SELECT Section.ID
      FROM Section
      JOIN Chapter_to_Section_relation ON Section.ID = Chapter_to_Section_relation.SectionID
      WHERE Chapter_to_Section_relation.ChapterID = ?
    )
  `;

  // 刪除Class_to_Chapter_relation
  const deleteClassChapterRelationQuery = `
    DELETE FROM Class_to_Chapter_relation
    WHERE ClassID = ? AND ChapterID = ?
  `;

  // 刪除Chapter
  const deleteChapterQuery = `
    DELETE FROM Chapter
    WHERE ID = ?
  `;

  // 開始執行刪除操作
  db.run(deleteChapterSectionsQuery, [ChapterID], (err) => {
    if (err) {
      res.status(500).json({ status: false, error: err.message });
      return;
    }

    db.run(deleteClassChapterRelationQuery, [ClassID, ChapterID], (err) => {
      if (err) {
        res.status(500).json({ status: false, error: err.message });
        return;
      }

      db.run(deleteChapterQuery, [ChapterID], (err) => {
        if (err) {
          res.status(500).json({ status: false, error: err.message });
          return;
        }

        res.json({ status: true, message: 'Chapter and associated content deleted successfully.' });
      });
    });
  });
});
/////////////////////////////////////////////////////章節中的section創建/刪除
app.post("/TeacherCreateSection", (req, res) => {
  const sectiontab = `
    INSERT INTO Section(Name,VideoID)
    VALUES(?, ?)
  `;
  const chapter_to_section = `
    INSERT INTO Chapter_to_Section_relation(ChapterID, SectionID)
    VALUES(?, ?)
  `;

  const selectSection = `
    SELECT ID, Name FROM Section WHERE ID = (SELECT last_insert_rowid())
  `;

  const SectionName = req.body.SectionName;
  const VideoID = req.body.VideoID;
  const ChapterID = req.body.ChapterID;

  db.run(sectiontab, [SectionName, VideoID], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    db.get(selectSection, [], function (err, row) {
      console.log(row);
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      if (!row) {
        res.status(200).json({ status: false, error: "Section not found." });
        return;
      }

      // 插入成功，回傳成功訊息
      db.run(chapter_to_section, [ChapterID, row.ID], function (err) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
          return;
        }

        // 回傳成功訊息及課程資訊
        res.json({
          status: true,
          data: {
            ID: row.ID,
            Name: row.Name,
          },
          message: 'Chapter create and connect Section successfully.',
        });
      });
    });
  });
});

app.post("/TeacherChangeSectionName", (req, res) => {
  const updateSectionName = `
    UPDATE Section
    SET Name = ?
    WHERE ID = ?
  `;

  const selectSection = `
    SELECT ID, Name, VideoID FROM Section
    WHERE ID = ?
  `;

  const SectionID = req.body.SectionID;
  const NewSectionName = req.body.SectionName;

  // 檢查傳入資料是否完整
  if (!SectionID || !NewSectionName) {
    res.status(400).json({ status: false, error: "SectionID and NewSectionName are required." });
    return;
  }

  // 更新section名稱
  db.run(updateSectionName, [NewSectionName, SectionID], function (err) {
    if (err) {
      res.status(500).json({ status: false, error: err.message });
      return;
    }

    // 取得更新後的section資訊
    db.get(selectSection, [SectionID], function (err, row) {
      if (err) {
        res.status(500).json({ status: false, error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ status: false, error: "Section not found for the specified SectionID." });
        return;
      }

      // 回傳訊息
      res.json({
        status: true,
        data: {
          ID: row.ID,
          Name: row.Name,
          VideoID: row.VideoID,
        },
        message: 'Section name updated successfully.',
      });
    });
  });
});


app.post("/TeacherDeleteSection", (req, res) => {
  //記得加入確認該Class的TeacherID為目前登入身分的ID
  const sectiontab = `
    DELETE FROM Section
    WHERE ID=?
  `;
  const chapter_to_section = `
    DELETE FROM Chapter_to_Section_relation
    WHERE ChapterID=? AND SectionID =?
  `;

  const SectionID = req.body.SectionID;
  const ChapterID = req.body.ChapterID;
  //const ClassName = req.body.ClassName;

  db.run(sectiontab, [SectionID], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 刪除成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(chapter_to_section, [ChapterID, SectionID], function (err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      // 刪除成功，回傳成功訊息
      res.json({ status: true, message: 'Teacher delete Section successfully.' });
    });
  });
});


//////////////////////////////////////////新增討論串/刪除
app.post("/CreateDiscuss", (req, res) => {
  const dicusstab = `
    INSERT INTO Discuss(PublisherName,Context,Date)
    VALUES(?, ?, ?)
  `;
  const class_to_dis = `
    INSERT INTO Class_to_Discuss_relation(ClassID,DiscussID)
    VALUES(?, ?)
  `;
  const selectLastInsert = `
    SELECT ID FROM Discuss WHERE ID = (SELECT last_insert_rowid())
  `;
  const PublisherName = req.body.user;
  const Context = req.body.content;
  const ClassID = req.body.ClassID;
  const Date = req.body.date;

  db.run(dicusstab, [PublisherName, Context, Date], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    const DiscussID = this.lastID;

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(class_to_dis, [ClassID, DiscussID], function (err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }
      db.get(selectLastInsert, [], function (err, row) {
        if (err) {
          res.status(200).json({ status: false, error: err });
          return;
        }
        // 插入成功，回傳成功訊息
        res.json({ status: true, data: row.ID, message: 'discuss create successfully.' });
      });
    });

  });

});

app.post("/DeleteDiscuss", (req, res) => {
  //記得加入確認該Class的TeacherID為目前登入身分的ID
  const discusstab = `
    DELETE FROM Discuss
    WHERE ID=?
  `;
  const class_to_discuss = `
    DELETE FROM Class_to_Discuss_relation
    WHERE ClassID=? AND DiscussID =?
  `;

  const DiscussID = req.body.DiscussID;
  const ClassID = req.body.ClassID;

  db.run(discusstab, [DiscussID], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(class_to_discuss, [ClassID, DiscussID], function (err) {
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
  const commenttab = `
    INSERT INTO Comments(PublisherName,Context,Date)
    VALUES(?, ?, ?)
  `;
  const discuss_to_comment = `
    INSERT INTO Discuss_to_Comment_relation(DisID,ComID)
    VALUES(?, ?)
  `;

  const PublisherName = req.body.PublisherName;
  const Context = req.body.Context;
  const DiscussID = req.body.DiscussID;
  const Date = req.body.Date;


  db.run(commenttab, [PublisherName, Context, Date], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    const comID = this.lastID;

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(discuss_to_comment, [DiscussID, comID], function (err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      // 插入成功，回傳成功訊息
      res.json({ status: true, message: 'comment create successfully.' });
    });

  });

});

app.post("/DeleteComment", (req, res) => {
  //記得加入確認該Class的TeacherID為目前登入身分的ID
  const commenttab = `
    DELETE FROM Discuss
    WHERE ID=?
  `;
  const discuss_to_comment = `
    DELETE FROM Class_to_Discuss_relation
    WHERE ClassID=? AND DiscussID =?
  `;

  const DiscussID = req.body.DiscussID;
  const ClassID = req.body.ClassID;

  db.run(commenttab, [DiscussID], function (err) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }

    // 插入成功，回傳成功訊息
    //res.json({ status: true, message: 'Create class successfully.' });
    db.run(discuss_to_comment, [ClassID, DiscussID], function (err) {
      if (err) {
        res.status(200).json({ status: false, error: err.message });
        return;
      }

      // 插入成功，回傳成功訊息
      res.json({ status: true, message: 'comment delete successfully.' });
    });

  });

});
////////////////////////////////////////////////用課程ID查詢討論串&留言
app.post("/GetClassDiscussion", function (req, res) {
  const classID = req.body.id;  // Class的ID
  var find_discuss = `
    SELECT Discuss.ID, Discuss.PublisherName, Discuss.Context, Discuss.Date
    FROM Class
    JOIN Class_to_Discuss_relation ON Class.ID = Class_to_Discuss_relation.ClassID
    JOIN Discuss ON Class_to_Discuss_relation.DiscussID = Discuss.ID
    WHERE Class.ID = ?;
  `;

  var result = [];

  db.all(find_discuss, [classID], (err, rows) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: false,
        data: result
      }));
      throw err;
    }
    if (rows.length == 0)
      res.status(200).json({ status: true, data: [] });
    // 處理查詢結果
    rows.forEach(discussRow => {
      var discussItem = {
        id: discussRow.ID,
        user: discussRow.PublisherName,
        content: discussRow.Context,
        date: discussRow.Date,
        comment: []
      };

      // 查詢評論
      var find_comment = `
        SELECT Comments.ID, Comments.PublisherName, Comments.Context, Comments.Date
        FROM Discuss
        JOIN Discuss_to_Comment_relation ON Discuss.ID = Discuss_to_Comment_relation.DisID
        JOIN Comments ON Discuss_to_Comment_relation.ComID = Comments.ID
        WHERE Discuss.ID = ?;
      `;

      db.all(find_comment, [discussRow.ID], (err, commentRows) => {
        if (err) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: false,
            data: result
          }));
          throw err;
        }

        // 處理評論結果
        commentRows.forEach(commentRow => {
          var commentItem = {
            user: commentRow.PublisherName,
            content: commentRow.Context,
            date: commentRow.Date
          };
          discussItem.comment.push(commentItem);
        });

        result.push(discussItem);

        // 如果所有的 Discuss 都處理完畢，回傳結果
        if (result.length === rows.length) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: true,
            data: result
          }));
        }
      });
    });
  });
});


///////////////////////////////////////查詢課程中的章節與小節
app.post("/GetClassInformation", (req, res) => {
  const classId = req.body.classId;
  const queryChapter = `
  SELECT Chapter.ID, Chapter.Name
  FROM Chapter 
  WHERE Chapter.ClassID = ?
  ORDER BY Chapter.ID;
  `;
  const querySection = `
  SELECT Section.ID, Section.Name, Section.VideoID
  FROM Section JOIN Chapter_to_Section_relation AS C_TO_S ON Section.ID = C_TO_S.SectionID
  WHERE C_TO_S.ChapterID = ?;
  `;
  let result = [];
  db.all(queryChapter, [classId], function (err, chapters) {
    if (err) {
      res.status(200).json({ status: false, error: err.message });
      return;
    }
    if (chapters.length == 0)
      res.status(200).json({ status: true, data: [] });
    chapters.forEach((chapter) => {
      let chapterData = {
        chapter: chapter.Name,
        chapterId: chapter.ID,
        section: []
      }
      db.all(querySection, [chapterData.chapterId], function (err, sections) {
        if (err) {
          res.status(200).json({ status: false, error: err.message });
          return;
        }
        sections.forEach((section) => {
          chapterData.section.push({
            name: section.Name,
            sectionId: section.ID,
            videoID: section.VideoID
          });
        });
        result.push(chapterData);
        if (result.length === chapters.length) {
          result.sort((a, b) => a.chapterId - b.chapterId);
          res.status(200).json({ status: true, data: result });
        }
      });
    });
  });
});

const port = 8080;
const ip = "127.0.0.1";

app.listen(port, ip, function () {
  console.log(`Server is running at http://${ip}:${port}`);
});

