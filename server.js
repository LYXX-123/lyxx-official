const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// ✅ CORS 및 보안 설정
app.use(cors());
app.use(bodyParser.json());

// ✅ 1. MongoDB 연결 (중요!)
// ⚠️ 아래 'MONGO_URI'에 실제 MongoDB 주소를 넣으셨는지 꼭 확인하세요.
// 예: "mongodb+srv://유저ID:비번@cluster.mongodb.net/데이터베이스이름"
const MONGO_URI = process.env.MONGODB_URI || "여기에_실제_몽고디비_주소를_넣어주세요";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successful"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ 2. 유저 스키마 (장바구니 필드 포함)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    email: String,
    address: String,
    cart: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);

// ✅ 3. API 라우트

// [메인 접속 확인]
app.get('/', (req, res) => { res.send("LYXX Server is Online!"); });

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
        console.error("Login Error:", e);
        res.status(500).json({ success: false, message: "로그인 중 서버 내부 에러" });
    }
});

// [회원가입]
app.post('/signup', async (req, res) => {
    const { username, password, name, email, address } = req.body;
    try {
        const newUser = new User({ username, password, name, email, address });
        await newUser.save();
        res.json({ success: true, message: "회원가입이 완료되었습니다." });
    } catch (e) {
        res.json({ success: false, message: "이미 사용 중인 아이디입니다." });
    }
});

// [장바구니 저장]
app.post('/save-cart', async (req, res) => {
    const { username, cart } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { cart: cart });
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

// [정보 수정]
app.post('/update-profile', async (req, res) => {
    const { username, address, password } = req.body;
    try {
        const updateData = {};
        if (address) updateData.address = address;
        if (password) updateData.password = password;
        await User.findOneAndUpdate({ username }, updateData);
        res.json({ success: true });
    } catch (e) {
        res.json({ success: false, message: "수정 실패" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));