
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.user_id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
};

// REGISTER
exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Full name, email and password are required.",
        });
    }

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
        return res.status(400).json({
            success: false,
            message: "Full name must contain at least 2 characters.",
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address.",
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long.",
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [existingUsers] = await connection.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [userResult] = await connection.execute(
            `INSERT INTO users (full_name, email, password_hash)
       VALUES (?, ?, ?)`,
            [normalizedName, normalizedEmail, passwordHash]
        );

        const userId = userResult.insertId;

        // Create default profile
        await connection.execute(
            "INSERT INTO user_profiles (user_id) VALUES (?)",
            [userId]
        );

        // Create default settings
        await connection.execute(
            `INSERT INTO user_settings
       (user_id, preferred_interview_type,
        preferred_difficulty, preferred_duration,
        questions_per_interview, weekly_goal,
        theme, notifications, privacy_settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                "Technical",
                "Intermediate",
                15,
                5,
                3,
                "dark",
                JSON.stringify({
                    email: true,
                    reminders: true,
                    performance: true,
                    announcements: false,
                }),
                JSON.stringify({
                    saveHistory: true,
                    performanceInsights: true,
                }),
            ]
        );

        await connection.commit();

        const user = {
            user_id: userId,
            full_name: normalizedName,
            email: normalizedEmail,
        };

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            token,
            user,
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create account. Please try again.",
        });
    } finally {
        if (connection) connection.release();
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required.",
        });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await db.execute(
            `SELECT user_id, full_name, email, password_hash
       FROM users
       WHERE email = ?
       LIMIT 1`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to login. Please try again.",
        });
    }
};


exports.getMe = async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT user_id, full_name, email
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0],
        });
    } catch (error) {
        console.error("Get user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve user details.",
        });
    }
};
