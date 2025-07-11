import { useState, useRef, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { createChat } from '../../data/gemini';
import Chat from './Chat';
import { useNavigate } from 'react-router';
import { setCookie } from '../../utils/cookieUtils';

const ChatApp = ({ onSuccess }) => {
  const chatRef = useRef();
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const handleChange = e => setPrompt(e.target.value);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!prompt) return toast.error('Please enter a prompt');
    setLoading(true);

    try {
      const userMsg = {
        _id: crypto.randomUUID(),
        role: 'user',
        parts: [{ text: prompt }]
      };

      setMessages(prev => [...prev, userMsg]);

      const response = await createChat({ message: prompt });

      // Console log the raw AI response for debugging
      console.log('Raw AI Response:', response.aiResponse);

      // Clean up the AI response by removing markdown code blocks if present
      let cleanedResponse = response.aiResponse;
      if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      }
      if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```/g, '');
      }

      // Console log the cleaned response
      console.log('Cleaned AI Response:', cleanedResponse);

      let aiExercises;
      try {
        aiExercises = JSON.parse(cleanedResponse);
        console.log('Parsed AI Exercises:', aiExercises);
      } catch (error) {
        console.error('JSON Parse Error:', error);
        console.error('Failed to parse response:', cleanedResponse);
        toast.error('Failed to parse AI response. Please try again.');
        return;
      }

      const rawPlan = localStorage.getItem('plan');
      let parsedPlan;

      if (!rawPlan) {
        // Create a base plan if none exists
        console.log('No plan found in localStorage, creating base plan');
        parsedPlan = {
          userId: '', // Will be set when saving
          name: 'AI Generated Plan',
          isPublic: false,
          exercise: []
        };
      } else {
        parsedPlan = JSON.parse(rawPlan);
      }

      // Set the AI generated exercises
      parsedPlan.exercise = aiExercises;

      // Save to localStorage and cookies
      localStorage.setItem('plan', JSON.stringify(parsedPlan));
      setCookie('plan', JSON.stringify(parsedPlan));

      toast.success('Workout plan generated successfully!');

      // Call onSuccess callback to trigger plan loading and close the form
      if (onSuccess) {
        onSuccess();
      }

      // set coockie
      // document.cookie = `workoutPlan=${encodeURIComponent(response.aiResponse)};max-age=86400`;
      //localStorage.setItem('workoutPlan', response.aiResponse);

      const aiMsg = {
        _id: crypto.randomUUID(),
        role: 'model',
        parts: [{ text: response.aiResponse }]
      };

      setMessages(prev => [...prev, aiMsg]);
      setPrompt('');
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[85vh] max-w-[1200px] flex flex-col bg-slate-600 rounded-lg mx-auto px-2 sm:px-6">
      {/* <Chat chatRef={chatRef} messages={messages} /> */}

      <div className="w-full p-4 sm:p-6 bg-slate-600 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={handleChange}
            rows="5"
            placeholder="Let me build a workout plan for you! What areas of your body would you like to train?..."
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          ></textarea>
          <button type="submit" className="mt-4 w-full btn btn-primary" disabled={loading}>
            Submit
          </button>
        </form>
      </div>

      <ToastContainer autoClose={1500} theme="colored" />
    </div>
  );
};

export default ChatApp;
