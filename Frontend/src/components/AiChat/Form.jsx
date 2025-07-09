import { useState } from 'react';
import { toast } from 'react-toastify';
import { createChat, createPersonalChat, fetchChat, fetchPersonalChat } from '../../data/gemini';
import { addOrUpdateMsg } from '../../utils/msgUtils';
import { useAuth } from '@/context';

const Form = ({ setMessages, chatId, setChatId }) => {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStream, setIsStream] = useState(false);

  const handleChange = e => setPrompt(e.target.value);
  const toggleChecked = () => setIsStream(prev => !prev);

  const handleSubmit = async e => {
    try {
      e.preventDefault();
      // If the prompt value is empty, alert the user
      if (!prompt) throw new Error('Please enter a prompt');

      // Disable the submit button
      setLoading(true);

      const userMsg = {
        _id: crypto.randomUUID(),
        role: 'user',
        parts: [{ text: prompt }]
      };

      setMessages(prev => [...prev, userMsg]);
      const aiMsg = {
        _id: crypto.randomUUID(),
        role: 'model',
        parts: [{ text: '' }]
      };

      if (isStream) {
        //process stream
        const response = isAuthenticated
          ? await fetchPersonalChat({ message: prompt, chatId, stream: isStream })
          : await fetchChat({ message: prompt, chatId, stream: isStream });

        // let response;

        // if (isAuthenticated) {
        //   response = await fetchPersonalChat({ message: prompt, chatId, stream: isStream });
        // } else {
        //   response = await fetchChat({ message: prompt, chatId, stream: isStream });
        // }
        // console.log(response);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // console.log(done, value);
          const chunk = decoder.decode(value, { stream: true });
          // console.log(chunk);
          const lines = chunk.split('\n');
          // console.log(lines);

          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const jsonStr = line.replace('data: ', '');
              // console.log(jsonStr);
              const data = JSON.parse(jsonStr);
              console.log(data);
              //if it has chatId property - update chatId state and local storage
              if (data.chatId) {
                localStorage.setItem('chatId', data.chatId);
                setChatId(data.chatId);
              } else if (data.text) {
                const { text } = data;

                setMessages(prev => addOrUpdateMsg(prev, aiMsg, text));
              }
            }
          });
        }
        // after the break
      } else {
        const response = isAuthenticated
          ? await createPersonalChat({ message: prompt, chatId, stream: isStream })
          : await createChat({ message: prompt, chatId, stream: isStream });

        console.log(response);

        aiMsg.parts[0].text = response.aiResponse;

        setMessages(prev => [...prev, aiMsg]);
        setChatId(response.chatId);
        localStorage.setItem('chatId', response.chatId);
      }

      setPrompt('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-1/3 w-full p-8 border-t-2'>
      <form onSubmit={handleSubmit}>
        <label className='flex gap-2 items-center my-2'>
          <input
            id='stream'
            type='checkbox'
            className='checkbox checkbox-primary'
            checked={isStream}
            onChange={toggleChecked}
            disabled={loading}
          />
          <span>Stream response?</span>
        </label>
        <input
          value={prompt}
          onChange={handleChange}
          id='prompt'
          rows='5'
          placeholder='Ask me anything...'
          className='block w-full px-4 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
        <button id='submit' type='submit' className='mt-4 w-full btn btn-primary' disabled={loading}>
          Submit✨
        </button>
      </form>
    </div>
  );
};

export default Form;
