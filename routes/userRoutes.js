const express = require('express')
const router = express.Router()
const User = require('../modal/Users')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
//Register

const secreteKey =process.env.SECRETOKEN

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ status: false, message: "All files are require" })

        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ status: false, message: "Email Already registered" });

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({ name, email, password: hashPassword });
        await newUser.save();

        return res.status(201).json({ status: true, message: "Register successful" })
    } catch (error) {
        return res.status(400).json({ status: false, message: "Something went wrong", error: error.message })
    }
})

//Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ status: false, message: "All files are require" })

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ status: true, message: "Invalid Credential" })
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRETOKEN, { expiresIn: '1hr' })

        return res.status(201).json({ status: true, message: "Login successful", token: token })
    } catch (error) {
        return res.status(400).json({ status: false, message: "Something went wrong", error: error.message })
    }
})


module.exports = router;