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
    <div className="w-full flex flex-col ">
      {/* <Chat chatRef={chatRef} messages={messages} /> */}

      <div className="w-full">
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={handleChange}
            rows="5"
            placeholder="Let me build a workout plan for you! What areas of your body would you like to train?..."
            className="bg-[#1a1a1a] block w-full px-4 py-2 border border-gray-600 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          ></textarea>
          <button
            type="submit"
            className={`mt-4 w-full px-4 py-2 rounded-lg text-lg font-semibold transition-colors ${
              loading
                ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                : 'bg-[#F2AB40] hover:bg-[#e09b2d] text-black active:bg-[#644f2c]'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Plan...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>

      <ToastContainer autoClose={1500} theme="colored" />
    </div>
  );
};

export default ChatApp;
