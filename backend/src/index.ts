import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import db from './config/db.config';
import authRoutes from './routes/auth_routes'
import userRoutes from './routes/user_routes'
import tweetRoutes from './routes/tweet_routes'
import reTweetRoutes from './routes/retweet_routes'
import followRoutes from './routes/follow_routes'
import commentRoutes from './routes/comment_routes'
import reactionRoutes from './routes/reaction_rotues'
import searchRoutes from "./routes/search_routes";
import path from 'path';

const app :  express.Application = express();
const clientDistPath = path.resolve(__dirname, "../dist/client");
const clientIndexPath = path.join(clientDistPath, "index.html");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(clientDistPath));
db;

const serveClient = (_req: express.Request, res: express.Response) => {
    res.sendFile(clientIndexPath);
};

app.use(
    cors({
        origin: ['https://x-clone-silk-tau.vercel.app', 'http://localhost:5173', 'http://localhost:4000'],
        credentials:true,
    }),
)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - Landing page
app.get("/", serveClient);

// Auth routes - View pages
app.get("/auth/signup", serveClient);

app.get("/auth/signin", serveClient);

// App View routes (client-side auth via localStorage JWT)
app.get("/home", serveClient);

app.get("/api/users/:username", serveClient);

// app.get("/api/tweet/:id", (req, res) => {
//     res.render("tweet");
// });

app.get("/explore", serveClient);

app.get("/feed", serveClient);

// render page (NO auth)
app.get("/api/tweet/:id", serveClient);


// API routes
app.use("/auth",authRoutes);
app.use("/users",userRoutes);
app.use("/tweets",tweetRoutes);
app.use("/retweets",reTweetRoutes);
app.use("/follows",followRoutes);
app.use("/comments",commentRoutes);
app.use("/reactions",reactionRoutes)
app.use("/search", searchRoutes);

app.use((req, res, next) => {
    if (req.method === "GET" && req.accepts("html")) {
        serveClient(req, res);
        return;
    }
    next();
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
