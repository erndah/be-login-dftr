import express from "express";
import db from "./config/databse.js"
import dotenv from "dotenv"
// import Users from "./models/UserModel.js";
import router from "./routes/index.js";
dotenv.config();
const app = express();

const port = 6000;

try {
    await db.authenticate();
    console.log("Database connected!");
    // await Users.sync(); // apabila blm ada table user, akan  sync otomatis
} catch (error) {
    console.error(error);
}

app.use(express.json());
app.use(router);

app.listen(port, () => console.log('Server running at http://localhost:'+port));