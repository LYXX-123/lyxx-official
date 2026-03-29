const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// ✅ CORS 설정 강화 (에러 방지)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// ✅ 1. MongoDB 연결 (가장 중요!)
// Render 대시보드 -> Settings -> Environment Variables에 MONGODB_URI를 등록하세요.
// 만약 등록 안 했다면 아래 따옴표 안에 실제 몽고디비 주소를 넣으세요.
const MONGO_URI = process.env.MONGODB_URI || "여기에_실제_몽고디비_주소를_꼭_넣으세요";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB 연결 성공"))
    .catch(err => console.error("❌ MongoDB 연결 실패:", err));

// ✅ 2. 유저 스키마 (장바구니 포함)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    email: String,
    address: String,
    cart: { type: Array, default: [] } 
});

const User = mongoose.model('User', userSchema);

// ✅ 3. API 경로

// [로그인]
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: "아이디 또는 비밀번호가 틀렸습니다." });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "서버 내부 에러" });
    }
});

// [회원가입]
app.post('/signup', async (req, res) => {
    const { username, password, name, email, address } = req.body;
    try {
        const newUser = new User({ username, password, name, email, address });
        await newUser.save();
        res.json({ success: true, message: "회원가입 완료!" });
    } catch (e) {
        res.json({ success: false, message: "이미 존재하는 아이디입니다." });
    }
});

// [프로필 수정]
app.post('/update-profile', async (req, res) => {
    const { username, address, password } = req.body;
    try {
        let updateData = {};
        if (address) updateData.address = address;
        if (password) updateData.password = password;
        await User.findOneAndUpdate({ username }, updateData);
        res.json({ success: true });
    } catch (e) {
        res.json({ success: false });
    }
});

// [장바구니 저장]
app.post('/save-cart', async (req, res) => {
    const { username, cart } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { cart });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// [장바구니 불러오기]
app.get('/get-cart', async (req, res) => {
    const { username } = req.query;
    try {
        const user = await User.findOne({ username });
        res.json({ success: true, cart: user ? user.cart : [] });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

app.get('/', (req, res) => { res.send("LYXX Server is Running!"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));