import express from "express";
import connectDBS from "./db/connected.js";
import cors from "cors";
import authRoutes from "./routes/authRoute.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
  })
);

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDBS(process.env.MONGO_URL);
    app.listen(PORT, () => console.log("Server Connected to the Port", PORT));
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

start();
