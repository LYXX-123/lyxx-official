const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔗 1. MongoDB 연결 (용준님 클러스터 주소)
const MONGO_URI = "mongodb+srv://admin:lyxx1234@cluster0.ouxd6dx.mongodb.net/LYXX_DB?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB 연결 성공"))
    .catch(err => console.log("❌ DB 연결 에러:", err));

// 📝 2. 유저 데이터 모델 설정
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 📧 3. 이메일 전송 설정 (비밀번호 찾기용)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lyxx.rechive@gmail.com',
        pass: 'znga rtdq bcma hvqc' // 구글 앱 비밀번호
    }
});

app.get('/', (req, res) => res.send('LYXX SERVER IS RUNNING!'));

// 👤 4. 회원가입 API
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

// 🔑 5. 로그인 API
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).json({ 
                success: true, 
                name: user.name, 
                username: user.username 
            });
        } else {
            res.status(200).json({ success: false, message: "아이디 또는 비밀번호가 틀렸습니다." });
        }
    } catch (e) { res.status(500).json({ success: false, message: "로그인 중 서버 에러" }); }
});

// 📧 6. 비밀번호 찾기 API (이메일 발송)
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
    } catch (e) { res.status(500).json({ success: false, message: "메일 발송 중 에러가 발생했습니다." }); }
});

// ✅ 7. [중요] 마이페이지 비밀번호 변경 API
app.post('/update-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    try {
        // 현재 아이디와 기존 비밀번호가 맞는지 확인
        const user = await User.findOne({ username, password: currentPassword });
        if (!user) return res.status(200).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
        
        // 새 비밀번호로 업데이트
        user.password = newPassword;
        await user.save();
        res.status(200).json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다!" });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ success: false, message: "서버 에러가 발생했습니다." }); 
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));