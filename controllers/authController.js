const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {

    const { name, email, password,confirmPassword } = req.body;
    // CHECK EMPTY FIELDS
if (!name || !email || !password) {
  return res.status(400).json({ message: "All fields are required" });
}
if (password !== confirmPassword) {
  return res.status(400).json({ message: "Passwords do not match" });
}

// STRONG PASSWORD VALIDATION
const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

if (!passwordPattern.test(password)) {
  return res.status(400).json({
    message: "Password must contain 8 characters, uppercase, number and special character"
  });
}
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) {
  return res.status(400).json({ message: "Email and password are required" });
}

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

