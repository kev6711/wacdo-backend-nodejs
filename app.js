const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/wacdo/users", require("./routes/users.routes"));

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startServer();
