import { useState, useRef, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { createChat } from '../../data/gemini';
import Chat from './Chat';

function ChatApp() {
  const chatRef = useRef();
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const handleChange = (e) => setPrompt(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) return toast.error('Please enter a prompt');
    setLoading(true);

    try {
      const userMsg = {
        _id: crypto.randomUUID(),
        role: 'user',
        parts: [{ text: prompt }],
      };

      setMessages((prev) => [...prev, userMsg]);

      const response = await createChat({ message: prompt });

      // set coockie here
      
      const aiMsg = {
        _id: crypto.randomUUID(),
        role: 'model',
        parts: [{ text: response.aiResponse }],
      };

      setMessages((prev) => [...prev, aiMsg]);
      setPrompt('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-h-[85vh] max-w-[1200px] flex flex-col bg-slate-600 rounded-lg mx-auto px-2 sm:px-6'>
      <Chat chatRef={chatRef} messages={messages} />
      <div className='w-full p-4 sm:p-6 bg-slate-600 rounded-lg shadow-md'>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={handleChange}
            rows='5'
            placeholder='Ask me anything...'
            className='block w-full px-4 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
          ></textarea>
          <button
            type='submit'
            className='mt-4 w-full btn btn-primary'
            disabled={loading}
          >
            Submit
          </button>
        </form>
      </div>
      <ToastContainer autoClose={1500} theme='colored' />
    </div>
  );
}

export default ChatApp;