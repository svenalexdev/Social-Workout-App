import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

const GroupFinder = () => {
  const navigate = useNavigate();

  // Mock data to be replaced with fetch later
  // 1. Add useState for fetched data: const [activities, setActivities] = useState([])
  // 2. Add useEffect to fetch data
  // 3. Replace mockData[0]

  let mockData = [
    {
      _id: '',
      userId: 'userId of person posting',
      name: 'Chest Workout',
      description:
        'This is a description of a workout activity and only mockdata. This is a description of a workout activity and only mockdata. This is a description of a workout activity and only mockdata.',
      gym: 'McFit',
      time: '18:00',
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
      <div className="mt-4 p-3 border border-gray-500 rounded-2xl max-w-md mx-auto flex flex-col overflow-hidden">
        <div className="flex items-center">
          <img src="https://cdn-icons-png.freepik.com/512/6833/6833605.png" className="h-20 w-20 rounded-full" />
          <div className="flex flex-col ml-2">
            <p>
              <span className="font-bold">Name: </span>
              {mockData[0].name}
            </p>
            <p>
              <span className="font-bold">Gym: </span>
              {mockData[0].gym}
            </p>
            <p>
              <span className="font-bold">Time: </span>
              {mockData[0].time}
            </p>
          </div>
        </div>
        <div className="attendees flex mt-2">
          <img
            src="https://static.vecteezy.com/system/resources/previews/024/183/525/non_2x/avatar-of-a-man-portrait-of-a-young-guy-illustration-of-male-character-in-modern-color-style-vector.jpg"
            className="ml-22 h-8 w-8 rounded-full"
          />
          <img
            src="https://static.vecteezy.com/system/resources/previews/004/899/680/non_2x/beautiful-blonde-woman-with-makeup-avatar-for-a-beauty-salon-illustration-in-the-cartoon-style-vector.jpg"
            className="ml-2 h-8 w-8 rounded-full"
          />
          <img
            src="https://img.freepik.com/vektoren-kostenlos/die-veranschaulichung-des-laechelnden-jungen_1308-174669.jpg?semt=ais_hybrid&w=740"
            className="ml-2 h-8 w-8 rounded-full"
          />
        </div>
        {/* Fetch description */}
        <p className="mt-4 max-h-16 overflow-hidden break-words">
          {mockData[0].description.length > 90 ? mockData[0].description.slice(0, 90) + '...' : mockData[0].description}
        </p>
        <div className="flex justify-center mt-5">
          <button className="btn bg-gray-500 h-8">See Workout Plan</button>
          <button className="btn bg-gray-500 ml-5 h-8">Ask to Join</button>
        </div>
      </div>
    </div>
  );
};

export default GroupFinder;
