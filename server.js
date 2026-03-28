const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔗 MongoDB 연결 (용준님 데이터베이스)
const MONGO_URI = "mongodb+srv://admin:lyxx1234@cluster0.ouxd6dx.mongodb.net/LYXX_DB?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB 연결 성공")).catch(err => console.log("❌ DB 연결 에러:", err));

// 📝 유저 데이터 구조 (이메일 필드 추가됨)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true } // ✅ 비밀번호 찾기용 이메일
});
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => res.send('SERVER IS RUNNING!'));

// 👤 회원가입 로직
app.post('/signup', async (req, res) => {
    const { username, password, name, email } = req.body;
    try {
        const exists = await User.findOne({ username });
        if (exists) return res.status(200).json({ success: false, message: "이미 존재하는 아이디입니다." });
        
        const newUser = new User({ username, password, name, email });
        await newUser.save();
        res.status(200).json({ success: true, message: "회원가입 완료! (이메일 등록됨)" });
    } catch (e) { 
        res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." }); 
    }
});

// 🔑 로그인 로직
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) res.status(200).json({ success: true, name: user.name, message: "로그인 성공!" });
        else res.status(200).json({ success: false, message: "아이디 또는 비밀번호가 틀렸습니다." });
    } catch (e) { res.status(500).json({ success: false, message: "로그인 중 에러 발생" }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));