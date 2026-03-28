const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// 1. 임시 데이터베이스 (서버 끄면 초기화됨)
// 실제 DB(MongoDB) 연결 전까지는 이 배열에 저장됩니다.
let users = [
    { username: 'admin', password: '123', name: 'KANEYAMA' }
];

// [로그인 API]
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, name: user.name });
    } else {
        res.json({ success: false, message: "아이디 또는 비밀번호가 틀렸습니다." });
    }
});

// [회원가입 API]
app.post('/signup', (req, res) => {
    const { username, password, name } = req.body;
    const exists = users.find(u => u.username === username);
    if (exists) {
        return res.json({ success: false, message: "이미 존재하는 아이디입니다." });
    }
    users.push({ username, password, name });
    res.json({ success: true, message: "회원가입이 완료되었습니다!" });
});

app.listen(3000, () => {
    console.log("🚀 LYXX 서버가 3000번 포트에서 가동 중입니다!");
});