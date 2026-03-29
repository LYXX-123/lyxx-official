const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔗 MongoDB 연결
const MONGO_URI = "mongodb+srv://admin:lyxx1234@cluster0.ouxd6dx.mongodb.net/LYXX_DB?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI).then(() => console.log("✅ MongoDB 연결 성공")).catch(err => console.log("❌ DB 연결 에러:", err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 📧 이메일 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lyxx.rechive@gmail.com',
        pass: 'znga rtdq bcma hvqc'
    }
});

app.get('/', (req, res) => res.send('SERVER IS RUNNING!'));

// 회원가입
app.post('/signup', async (req, res) => {
    const { username, password, name, email } = req.body;
    try {
        const exists = await User.findOne({ username });
        if (exists) return res.status(200).json({ success: false, message: "이미 존재하는 아이디입니다." });
        const newUser = new User({ username, password, name, email });
        await newUser.save();
        res.status(200).json({ success: true, message: "회원가입 완료!" });
    } catch (e) { res.status(500).json({ success: false, message: "서버 에러" }); }
});

// 로그인
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) res.status(200).json({ success: true, name: user.name });
        else res.status(200).json({ success: false, message: "정보가 틀렸습니다." });
    } catch (e) { res.status(500).json({ success: false }); }
});

// 비밀번호 찾기
app.post('/find-password', async (req, res) => {
    const { username, email } = req.body;
    try {
        const user = await User.findOne({ username, email });
        if (!user) return res.status(200).json({ success: false, message: "일치하는 정보가 없습니다." });
        const mailOptions = {
            from: 'lyxx.rechive@gmail.com',
            to: user.email,
            subject: '[LYXX Official] 비밀번호 찾기 결과입니다.',
            text: `안녕하세요 ${user.name}님, 요청하신 비밀번호는 [ ${user.password} ] 입니다.`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "입력하신 이메일로 비밀번호를 보냈습니다!" });
    } catch (e) { res.status(500).json({ success: false, message: "메일 발송 에러" }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));