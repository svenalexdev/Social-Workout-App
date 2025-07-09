/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
// import { getChatHistory } from '@/data';
import { getChatHistory } from '../../data/gemini';
import Form from './Form';
import Chat from './Chat';
function ChatWindow() {
  // let us reference DOM element for scroll effect
  const chatRef = useRef();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(localStorage.getItem('chatId'));

  // scroll to bottom of chat when new message is added
  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  useEffect(() => {
    const getAndSetChatHistory = async () => {
      try {
        const { history } = await getChatHistory(chatId);

        if (!history) throw new Error('History not found');

        setMessages(history);
      } catch (error) {
        console.log(error);
        localStorage.removeItem('chatId');
      }
    };

    chatId && getAndSetChatHistory();
  }, []);

  return (
    <div className='max-h-[85vh] max-w-[1200px] flex flex-col bg-slate-600 rounded-lg'>
      <Chat chatRef={chatRef} messages={messages} />
      <Form chatRef={chatRef} setMessages={setMessages} chatId={chatId} setChatId={setChatId} />
      <ToastContainer autoClose={1500} theme='colored' />
    </div>
  );
}

export default ChatWindow;
