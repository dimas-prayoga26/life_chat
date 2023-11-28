import React, { useState, useEffect,useRef } from 'react'
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { allUsersRoute, host } from "../utils/APIRoutes";
// import Welcome from '../components/Welcome';
// import Contacts from '../components/Contacts';
// import ChatContainer from '../components/ChatContainer';
import { Welcome, Contacts, ChatContainer } from "../components";
import { io } from "socket.io-client";

function Chat() {
  const socket = useRef();
  const navigate = useNavigate();

  const [isLoaded, setIsLoaded] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
          navigate("/login");
        } else {
          const user = await JSON.parse(localStorage.getItem(process.env.REACT_APP));
          setCurrentUser(user);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchData();
  }, []);

  useEffect (() => {
    if(currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  },[currentUser]);
  

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (currentUser) {
          if (currentUser.isAvatarImageSet) {
            const response = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            setContacts(response.data);
          } else {
            navigate("/setAvatar");
          }
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
  
    fetchContacts();
  }, [currentUser]);
  
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <Contacts 
          contacts = {contacts} 
          currentUser = {currentUser} 
          changeChat = {handleChatChange}
        />
          { isLoaded && currentChat === undefined ? (
            <Welcome currentUser={currentUser} />
          ) : ( 
            <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket}/>
          )}
      </div>
    </Container>
  );
}


const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width:720px) and (max-width:1080px) {
      grid-template-columns: 35% 65%;

    }
  }
  `;

export default Chat;
