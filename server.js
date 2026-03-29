const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. MongoDB 연결 (용준님의 MongoDB URI를 넣어주세요)
// Render 환경변수에 MONGODB_URI를 등록하는 것이 가장 안전합니다.
const MONGO_URI = process.env.MONGODB_URI || "여기에_용준님의_몽고디비_주소를_넣으세요";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log("MongoDB Connection Error:", err));

// 2. 유저 스키마 정의 (장바구니 필드 'cart' 추가)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    email: String,
    address: String,
    cart: { type: Array, default: [] } // ✅ 장바구니 영구 저장 공간
});

const User = mongoose.model('User', userSchema);

// 3. API 경로 설정

// [회원가입]
app.post('/signup', async (req, res) => {
    const { username, password, name, email, address } = req.body;
    try {
        const newUser = new User({ username, password, name, email, address });
        await newUser.save();
        res.json({ success: true, message: "Sign up successful!" });
    } catch (e) {
        res.json({ success: false, message: "Username already exists or Error." });
    }
});

// [로그인] - 유저 데이터를 통째로 넘겨 마이페이지 연동
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: "Invalid ID or Password." });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// [프로필 업데이트] - 주소 및 비번 수정용
app.post('/update-profile', async (req, res) => {
    const { username, address, password } = req.body;
    try {
        const updateData = {};
        if (address) updateData.address = address;
        if (password) updateData.password = password;

        const updatedUser = await User.findOneAndUpdate({ username }, updateData, { new: true });
        res.json({ success: true, user: updatedUser });
    } catch (e) {
        res.json({ success: false, message: "Update failed." });
    }
});

// [장바구니 저장] ✅ 새로 추가
app.post('/save-cart', async (req, res) => {
    const { username, cart } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { cart: cart });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// [장바구니 불러오기] ✅ 새로 추가
app.get('/get-cart', async (req, res) => {
    const { username } = req.query;
    try {
        const user = await User.findOne({ username });
        res.json({ success: true, cart: user ? user.cart : [] });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));