const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔗 Ryushun님의 실제 MongoDB 주소 연결
const MONGO_URI = "mongodb+srv://admin:lyxx1234@cluster0.ouxd6dx.mongodb.net/LYXX_DB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas 연결 성공!"))
  .catch(err => console.log("❌ DB 연결 에러:", err));

// 사용자 스키마 설정
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true, name: user.name });
        else res.json({ success: false, message: "아이디 또는 비밀번호가 틀렸습니다." });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/signup', async (req, res) => {
    const { username, password, name } = req.body;
    try {
        const exists = await User.findOne({ username });
        if (exists) return res.json({ success: false, message: "이미 존재하는 아이디입니다." });
        const newUser = new User({ username, password, name });
        await newUser.save();
        res.json({ success: true, message: "회원가입 완료!" });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 가동 중입니다!`);
});