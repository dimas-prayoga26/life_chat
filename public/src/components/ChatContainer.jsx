import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import axios from "axios";
import { getAllMessagesRoute, sendMessageRoute } from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";
import io from "socket.io-client";

export default function ChatContainer({ currentChat, currentUser, socket }) {

  // const socket = useRef(io("http://localhost:5000"));

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await axios.post(getAllMessagesRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }

    fetchMessages();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
    setIsTyping(false);
  };

  const handleTypingStatus = (status) => {
    socket.current.emit("typing-status", {
      to: currentChat._id,
      from: currentUser._id,
      isTyping: status,
    });
  };
  
  

  useEffect(() => {
    console.log("Socket connection:", socket.current);
  
    if (socket.current) {
      socket.current.on("typing-status", ({ from, isTyping }) => {
        console.log("Received typing status:", { from, isTyping });
        // ...
      });
    } else {
      console.log("Socket connection not established yet.");
    }
  }, [socket, currentChat]);
  
  
  
  
  
// ...

  
  

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64, ${currentChat.avatarImage}`}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h3>{currentChat.username}</h3>
                {isTyping && (
                  <p className="typing-indicator">Sedang mengetik...</p>
                )}
              </div>
            </div>
            <Logout />
          </div>
          <div className="chat-messages">
            {messages.map((message) => (
              <div ref={scrollRef} key={uuidv4()}>
                <div
                  className={`message ${
                    message.fromSelf ? "sended" : "recieved"
                  }`}
                >
                  <div className="content">
                    <p>{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ChatInput
            handleSendMsg={handleSendMsg}
            isTyping={isTyping}
            handleTypingStatus={handleTypingStatus}
          />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  padding-top: 1rem;
  display :grid;
  grid-template-rows : 10% 78% 12%;
  gap : 0.1rem;
  overflow : hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
  .typing-indicator {
    color: #ffffff;
    font-size: 0.8rem;
  }
`;