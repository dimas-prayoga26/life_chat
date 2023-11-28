import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import { IoMdSend } from "react-icons/io"
import { BsEmojiSmileFill } from "react-icons/bs"
import io from "socket.io-client";

export default function ChatInput({handleSendMsg, isTyping, handleTypingStatus}) {

    const socket = io("http://localhost:5000");

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [msg, setMsg] = useState("");

    const handleEmojiPickerHideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiClick = (event) => {
        let message = msg;
        message += event.emoji;
        setMsg(message);
    };

    const sendChat = (event) => {
        event.preventDefault();
        if(msg.length > 0) {
            handleSendMsg(msg);
            setMsg('');
        }
    };

    const handleTyping = (event) => {
        setMsg(event.target.value);
        if (event.target.value.length > 0 && !isTyping) {
          handleTypingStatus(true);
          socket.emit("typing-status", true);
        } else if (event.target.value.length === 0 && isTyping) {
          handleTypingStatus(false);
          socket.emit("typing-status", false);
        }
      };

    useEffect(() => {
    if (socket.current) {
        socket.current.on("typing-status", (status) => {
        handleTypingStatus(status);
        });
    }
    }, [socket]);
    

    return (
        <Container>
          <div className="button-container">
            <div className="emoji">
              <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
              <div className="emoji-position">{showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}</div>
            </div>
          </div>
          <form className="input-container" onSubmit={(e) => sendChat(e)}>
            <input
              type="text"
              placeholder="type your message here"
              value={msg}
              onChange={(e) => handleTyping(e)} // Menggunakan handleTyping untuk memantau perubahan input
            />
            <button className="submit">
              <IoMdSend />
            </button>
          </form>
        </Container>
      );
    }

const Container = styled.div`
    display: grid;
    grid-template-columns: 5% 95%;
    align-items: center;
    background-color: #080420;
    padding: 0 2rem;
    padding-buttom: 0.3rem;
    @media (min-width: 768px) and (max-width: 1080px) {
        padding: 0 1rem;
        gap:1rem;
    }
    .button-container {
        display: flex;
        align-items: center;
        color: white;  
        gap: 1rem;
        .emoji {
            position: relative;
            svg {
                font-size: 1.5rem;
                color: #ffff00c8;
                cursor: pointer;
            }
            .EmojiPickerReact {
                position: absolute;
                top: -350px; /* Sesuaikan nilai ini dengan posisi yang diinginkan */
                max-width: 280px; /* Sesuaikan lebar kotak */
                max-height: 340px; /* Sesuaikan tinggi maksimal kotak */        
                background-color: 0px 5px 10px #9a86f3;
                border-color: #9186f3;
            }
        }
    }
    .input-container {
        width: 100%;
        border-radius: 2rem;
        display: flex;
        align-content: center;
        gap: 2rem;
        background-color: #ffffff34;
        input {
            width: 90%;
            /* height: 60%; */
            background-color: transparent;
            color: white;
            border: none;
            padding-left: 1rem;
            font-size: 1.2rem;
            &::placeholder {
                /* Gaya untuk placeholder */
                line-height: 1.5; /* Sesuaikan dengan kebutuhan untuk membuat teks ke bawah */
                vertical-align: middle; /* Memastikan teks di tengah vertikal */
                text-align: center; /* Menengahkan teks placeholder */
                margin-top: 100px;

            }
            &::selection {
                background-color: #9186f3;
            }
            &:focus {
                outline: none;
            }
        }
        button {
            padding: 0.3rem 2rem;
            border-radius: 2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #9a86f3;
            border: none;
            @media screen and (min-width: 768px) and (max-width: 1080px) {
                padding: 0%.3rem 1rem;
                svg {
                    font-size :1rem;
                }
            }
            svg {
                font-size: 2rem;
                color: white;
            }
        }
    }
`;