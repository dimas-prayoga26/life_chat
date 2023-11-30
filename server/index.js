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

  socket.on("typing-status", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("typing-status", { isTyping: data.isTyping });
    } else {
      return false;
    }
  });
  

  
})

