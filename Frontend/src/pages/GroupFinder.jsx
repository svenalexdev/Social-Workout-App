import { useNavigate } from 'react-router';
import { useState } from 'react';

import React from 'react';

const GroupFinder = () => {
  const navigate = useNavigate();

  let mockData = [
    {
      _id: '',
      userId: 'userId of person posting',
      name: 'Chest Workout',
      description: '',
      gym: 'gymname',
      time: 'Time',
      showworkoutplan: 'true',
      workoutplanid: 'ID',
      'attendees-limit': 3,
      attendees: [
        { userId: '', status: 'pending/confirmed/denied' }
        // {all users pending or accepted}
      ],
      bodyparts: [
        'back',
        'cardio',
        'chest',
        'lower arms',
        'lower legs',
        'neck',
        'shoulders',
        'upper arms',
        'upper legs',
        'waist'
      ]
    }
    // { All activities as above }
  ];

  // State management
  const [selectedBodyparts, setSelectedBodyparts] = useState([]);

  // Handler
  // Handler to go back to plan page
  const handleGoBack = () => {
    navigate('/');
  };

  // Handle selecting bodyparts
  const handleSelect = part => {
    if (!selectedBodyparts.includes(part)) {
      setSelectedBodyparts([...selectedBodyparts, part]);
    }
  };

  // Handle removing bodyparts
  const handleRemove = part => {
    setSelectedBodyparts(selectedBodyparts.filter(p => p !== part));
  };

  // Other
  // Collect all bodyparts from mockData
  const allBodyparts = mockData[0].bodyparts;

  // Capitalize words
  const capitalizeWords = str => {
    if (!str) return '';
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex items-center">
        <button onClick={handleGoBack} className="btn text-lg bg-gray-500 border-none text-white">
          X
        </button>
        <h1 className="flex-1 text-center font-bold text-2xl">Find A Group!</h1>
        <div className="w-12" />
      </div>
      <h2 className="mt-8 font-bold text-xl">Filter By Body Part</h2>
      {/* Filter UI */}
      <div className="flex flex-wrap gap-2 mt-4">
        {allBodyparts.map(part => {
          const selected = selectedBodyparts.includes(part);
          return (
            <button
              key={part}
              onClick={() => (selected ? handleRemove(part) : handleSelect(part))}
              className={`flex items-center px-3 py-1 rounded-full border transition-colors 
                ${
                  selected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-700 text-gray-200 border-gray-500 hover:bg-blue-800'
                }`}
            >
              <span>{capitalizeWords(part)}</span>
              {selected && <span className="ml-2 font-bold text-white">x</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-10 flex">
        <h2 className="font-bold text-xl">Matching Activities</h2>
      </div>
      <div className="mt-4 border border-gray-500 rounded-2xl h-50 w-90 mx-auto flex flex-col justify-between">
        <img src="https://cdn-icons-png.freepik.com/512/6833/6833605.png" className="h-18 w-18 m-4 rounded-full" />
        <div className="flex justify-center mb-3">
          <button className="btn bg-gray-500 h-8">See Workout Plan</button>
          <button className="btn bg-gray-500 ml-5 h-8">Ask to Join</button>
        </div>
      </div>
    </div>
  );
};

export default GroupFinder;
