const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messagesRoute = require("./routes/messageRoute");
const socket = require("socket.io");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messagesRoute);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection established");
  })
  .catch((err) => {
    console.error(err.message);
  });
const server = app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});

const io = socket(server, {
  cors : {
    origin:"http://localhost:3000",
    credentials :true,
  },
});

global.onlineUsers = new Map();
const typingStatus = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user",(userId) =>{
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data)=> {
    console.log("sending message", {data});
    const sendUserSocket = onlineUsers.get(data.to);
    if(sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve",data.message);
    }
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

    // Assuming you're using a Map to store typing status for each user
  // const typingStatus = new Map();

  socket.on("typing-status", (data) => {
    // Simpan status mengetik untuk setiap penerima
    typingStatus.set(data.to, data.isTyping);

    // Emit ke penerima pesan
    socket.to(data.to).emit("typing-status", { from: data.from, isTyping: data.isTyping });
  });
  

  
})

