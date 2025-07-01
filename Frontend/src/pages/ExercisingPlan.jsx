import { useState, useEffect } from 'react';

function ExercisingPlan() {
  // State management
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutSession, setWorkoutSession] = useState(null);
  const [setInputs, setSetInputs] = useState({});
  const [collapsedExercises, setCollapsedExercises] = useState({});
  const [workoutData, setWorkoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsFor, setShowDetailsFor] = useState(null); // Track which exercise is showing details
  // Pause timer state
  const [pauseTimer, setPauseTimer] = useState({
    isActive: false,
    remainingTime: 0,
    exerciseId: null,
    exerciseName: ''
  });

  const getData = async () => {
    try {
      setIsLoading(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${BACKEND_URL}/plans/6863f28e9db013e76b0dadb6`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch workout plan');
      }

      const data = await res.json();
      setWorkoutData(data);
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize or restore workout session
  useEffect(() => {
    const initializeWorkout = async () => {
      localStorage.clear();
      // Fetch workout data first
      const data = await getData();

      if (!data) {
        console.error('Failed to fetch workout data');
        return;
      }

      const sessionKey = `workout_session_${data._id}`;
      const savedSession = localStorage.getItem(sessionKey);

      if (savedSession) {
        const session = JSON.parse(savedSession);
        setWorkoutSession(session);
        setCurrentExerciseIndex(session.currentExerciseIndex || 0);
        setSetInputs(session.setInputs || {});
        setCollapsedExercises(session.collapsedExercises || {});
      } else {
        // Create new session with default collapsed state
        const initialCollapsedState = {};
        console.log(data.exercise, data);
        data.exercise.forEach((exercise, index) => {
          // Collapse all exercises except the first one
          initialCollapsedState[exercise.exerciseId] = index !== 0;
        });

        const newSession = {
          workoutSessionId: `session_${Date.now()}`,
          workoutId: data._id,
          startTime: new Date().toISOString(),
          currentExerciseIndex: 0,
          completedSets: [],
          setInputs: {},
          collapsedExercises: initialCollapsedState
        };
        setWorkoutSession(newSession);
        setCollapsedExercises(initialCollapsedState);
        saveToLocalStorage(newSession, data._id);
        setIsTimerRunning(true);
      }
    };

    initializeWorkout();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Pause timer effect
  useEffect(() => {
    let interval = null;
    if (pauseTimer.isActive && pauseTimer.remainingTime > 0) {
      interval = setInterval(() => {
        setPauseTimer(prev => ({
          ...prev,
          remainingTime: prev.remainingTime - 1
        }));
      }, 1000);
    } else if (pauseTimer.isActive && pauseTimer.remainingTime <= 0) {
      // Timer finished, stop it
      setPauseTimer(prev => ({
        ...prev,
        isActive: false,
        remainingTime: 0
      }));
    }
    return () => clearInterval(interval);
  }, [pauseTimer.isActive, pauseTimer.remainingTime]);

  // Save session to localStorage
  const saveToLocalStorage = (session, workoutId = workoutData?._id) => {
    if (!workoutId) return;
    const sessionKey = `workout_session_${workoutId}`;
    localStorage.setItem(sessionKey, JSON.stringify(session));
  };

  // Update session state and save
  const updateSession = updates => {
    const updatedSession = { ...workoutSession, ...updates };
    setWorkoutSession(updatedSession);
    saveToLocalStorage(updatedSession);
  };

  // Check if an exercise is completed (all sets done)
  const isExerciseCompleted = exerciseId => {
    if (!workoutData) return false;
    const exercise = workoutData.exercise.find(ex => ex.exerciseId === exerciseId);
    if (!exercise) return false;

    const completedSetsForExercise = workoutSession.completedSets?.filter(set => set.exerciseId === exerciseId) || [];

    return completedSetsForExercise.length === exercise.sets;
  };

  // Auto-progress to next exercise when current one is completed
  useEffect(() => {
    if (!workoutSession || !workoutData) return;

    const currentExercise = workoutData.exercise[currentExerciseIndex];
    if (currentExercise && isExerciseCompleted(currentExercise.exerciseId)) {
      // Current exercise is completed, move to next
      const nextIndex = currentExerciseIndex + 1;

      if (nextIndex < workoutData.exercise.length) {
        // Move to next exercise
        const newCollapsedState = { ...collapsedExercises };

        // Collapse current exercise
        newCollapsedState[currentExercise.exerciseId] = true;

        // Expand next exercise
        const nextExercise = workoutData.exercise[nextIndex];
        newCollapsedState[nextExercise.exerciseId] = false;

        setCurrentExerciseIndex(nextIndex);
        setCollapsedExercises(newCollapsedState);

        updateSession({
          currentExerciseIndex: nextIndex,
          collapsedExercises: newCollapsedState
        });
      }
      // Note: Removed automatic workout completion alert
    }
  }, [workoutSession?.completedSets, currentExerciseIndex, workoutData]);

  // Handle input changes for weight and reps
  const handleInputChange = (exerciseId, setNumber, field, value) => {
    const key = `${exerciseId}_${setNumber}`;
    const newInputs = {
      ...setInputs,
      [key]: {
        ...setInputs[key],
        [field]: value
      }
    };
    setSetInputs(newInputs);
    updateSession({ setInputs: newInputs });
  };

  // Complete a set (individual set completion)
  const toggleSetCompletion = (exerciseId, setNumber) => {
    const completedSetId = `${exerciseId}_${setNumber}`;
    const isAlreadyCompleted = workoutSession.completedSets?.some(
      set => set.exerciseId === exerciseId && set.setNumber === setNumber
    );

    let updatedCompletedSets;

    if (isAlreadyCompleted) {
      // Remove the completed set
      updatedCompletedSets = workoutSession.completedSets.filter(
        set => !(set.exerciseId === exerciseId && set.setNumber === setNumber)
      );
    } else {
      // Add the completed set
      const key = `${exerciseId}_${setNumber}`;
      const setData = setInputs[key] || {};
      const currentExercise = workoutData.exercise.find(ex => ex.exerciseId === exerciseId);

      const completedSet = {
        exerciseId: exerciseId,
        setNumber: setNumber,
        weight: setData.weight || currentExercise.weight,
        reps: setData.reps || currentExercise.reps,
        completedAt: new Date().toISOString()
      };

      updatedCompletedSets = [...(workoutSession.completedSets || []), completedSet];

      // Start pause timer after completing a set
      startPauseTimer(exerciseId);
    }

    updateSession({ completedSets: updatedCompletedSets });
  };

  // Toggle exercise collapse state
  const toggleExerciseCollapse = exerciseId => {
    const newCollapsedState = {
      ...collapsedExercises,
      [exerciseId]: !collapsedExercises[exerciseId]
    };
    setCollapsedExercises(newCollapsedState);
    updateSession({ collapsedExercises: newCollapsedState });
  };

  // Finish workout manually
  const finishWorkout = () => {
    setIsTimerRunning(false);
    updateSession({
      completedAt: new Date().toISOString()
    });
    alert('🎉 Workout completed! Great job!');
    // You could also navigate to a completion page or reset the workout here
  };

  // Check if workout is ready to be finished (at least some sets completed)
  const canFinishWorkout = workoutSession?.completedSets?.length > 0;

  // Format timer display
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start pause timer after completing a set
  const startPauseTimer = exerciseId => {
    const exercise = workoutData.exercise.find(ex => ex.exerciseId === exerciseId);
    if (exercise && exercise.restTime) {
      setPauseTimer({
        isActive: true,
        remainingTime: exercise.restTime,
        exerciseId: exerciseId,
        exerciseName: exercise.name || `Exercise ${exerciseId}`
      });
    }
  };

  // Adjust pause timer by seconds (positive to add, negative to subtract)
  const adjustPauseTimer = seconds => {
    setPauseTimer(prev => ({
      ...prev,
      remainingTime: Math.max(0, prev.remainingTime + seconds)
    }));
  };

  // Stop pause timer manually
  const stopPauseTimer = () => {
    setPauseTimer({
      isActive: false,
      remainingTime: 0,
      exerciseId: null,
      exerciseName: ''
    });
  };

  if (!workoutSession || isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!workoutData) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading workout data</div>;
  }

  const currentExercise = workoutData.exercise[currentExerciseIndex];
  const currentExerciseName = currentExercise.name || `Exercise ${currentExercise.exerciseId}`;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{workoutData.name}</h1>
      </div>

      {/* Fixed Timer & Date Bar */}
      <div className="sticky top-4 z-10 bg-gray-900 rounded-lg p-4 mb-6 border border-gray-600 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-gray-300">
            <span className="flex items-center gap-1">📅 {new Date().toLocaleDateString()}</span>
            <span className="flex items-center gap-1">⏱️ {formatTime(timer)}</span>
          </div>
          {/* <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isTimerRunning ? '⏸️ Pause' : '▶️ Start'} Timer
          </button> */}
        </div>
      </div>

      {/* All Exercises in Order */}
      <div className="space-y-4">
        {workoutData.exercise.map((exercise, index) => {
          const exerciseName = exercise.name || `Exercise ${exercise.exerciseId}`;
          const isCurrent = index === currentExerciseIndex;
          const isCollapsed = collapsedExercises[exercise.exerciseId];
          const exerciseCompleted = isExerciseCompleted(exercise.exerciseId);

          return (
            <div
              key={exercise._id}
              className={`rounded-lg border ${
                isCurrent ? 'bg-gray-700 border-blue-500 border-2' : 'bg-gray-800 border-gray-600'
              }`}
            >
              {/* Exercise Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-750"
                onClick={() => toggleExerciseCollapse(exercise.exerciseId)}
              >
                {/* Exercise Image */}
                {isCurrent ? (
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name || 'Exercise'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={exercise.gifUrl}
                      alt={exercise.name || 'Exercise'}
                      className="w-full h-full object-cover rounded-lg opacity-60"
                    />
                  </div>
                )}
                {/* Exercise Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${isCurrent ? 'text-2xl text-white' : 'text-lg'}`}>{exerciseName}</h3>
                    </div>
                    {!isCollapsed && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setShowDetailsFor(showDetailsFor === exercise.exerciseId ? null : exercise.exerciseId);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-full transition-colors"
                      >
                        Details
                      </button>
                    )}
                  </div>
                  {/* <div className="text-sm text-gray-400">
                    {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                  </div> */}
                </div>{' '}
                {/* Collapse/Expand Indicator */}
                {/* <div className="text-gray-400">{isCollapsed ? '▼' : '▲'}</div> */}
              </div>

              {/* Exercise Details - Collapsible */}
              {!isCollapsed && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-5 gap-2 mb-2 text-sm font-semibold text-gray-300">
                    <span>Set</span>
                    <span>Previous</span>
                    <span>kg</span>
                    <span>Reps</span>
                    <span>✓</span>
                  </div>

                  {[...Array(exercise.sets)].map((_, setIndex) => {
                    const setNumber = setIndex + 1;
                    const key = `${exercise.exerciseId}_${setNumber}`;
                    const setData = setInputs[key] || {};
                    const isSetCompleted = workoutSession.completedSets?.some(
                      set => set.exerciseId === exercise.exerciseId && set.setNumber === setNumber
                    );

                    // Find the most recently completed set
                    const lastCompletedSet = workoutSession.completedSets?.reduce((latest, set) => {
                      if (!latest || new Date(set.completedAt) > new Date(latest.completedAt)) {
                        return set;
                      }
                      return latest;
                    }, null);

                    const isLastCompletedSet =
                      lastCompletedSet &&
                      lastCompletedSet.exerciseId === exercise.exerciseId &&
                      lastCompletedSet.setNumber === setNumber;

                    return (
                      <div
                        key={setNumber}
                        className={`grid grid-cols-5 gap-2 p-2 rounded transition-colors ${
                          isLastCompletedSet
                            ? 'bg-gray-700' // Lighter background for most recent completed set
                            : 'bg-gray-900'
                        } ${isSetCompleted ? 'opacity-80' : ''}`}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600">
                          {setNumber}
                        </span>
                        <span className="text-gray-400 flex items-center">—</span>
                        <input
                          type="number"
                          value={setData.weight || exercise.weight}
                          onChange={e => handleInputChange(exercise.exerciseId, setNumber, 'weight', e.target.value)}
                          className="bg-gray-700 rounded px-2 py-1 text-center"
                        />
                        <input
                          type="number"
                          value={setData.reps || exercise.reps}
                          onChange={e => handleInputChange(exercise.exerciseId, setNumber, 'reps', e.target.value)}
                          className="bg-gray-700 rounded px-2 py-1 text-center"
                          min="1"
                          max="99"
                        />
                        <button
                          onClick={() => toggleSetCompletion(exercise.exerciseId, setNumber)}
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                            isSetCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-500 hover:border-green-400'
                          }`}
                        >
                          {isSetCompleted && '✓'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Finish Workout Button */}
      <div className={`mt-8 mb-6 ${pauseTimer.isActive ? 'pb-24' : ''}`}>
        <button
          onClick={finishWorkout}
          disabled={!canFinishWorkout}
          className={`w-full py-4 rounded-lg text-lg font-bold transition-colors ${
            canFinishWorkout ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canFinishWorkout ? '🏁 Finish Workout' : '🏁 Complete some sets to finish'}
        </button>
      </div>

      {/* Sticky Pause Timer - Bottom */}
      {pauseTimer.isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="bg-orange-600 rounded-t-lg p-4 border border-orange-500 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between">
              {/* Decrease Timer Button */}
              <button
                onClick={() => adjustPauseTimer(-10)}
                className="bg-orange-700 hover:bg-orange-800 text-white px-4 py-2 rounded-lg transition-colors font-bold"
              >
                -10s
              </button>

              {/* Timer Display */}
              <div className="flex-1 text-center">
                <div className="text-white text-sm font-medium mb-1">Rest Time</div>
                <div className="text-white text-2xl font-bold">{formatTime(pauseTimer.remainingTime)}</div>
                <div className="text-orange-200 text-xs">{pauseTimer.exerciseName}</div>
              </div>

              {/* Increase Timer Button */}
              <button
                onClick={() => adjustPauseTimer(10)}
                className="bg-orange-700 hover:bg-orange-800 text-white px-4 py-2 rounded-lg transition-colors font-bold"
              >
                +10s
              </button>
            </div>

            {/* Skip Rest Button */}
            <div className="mt-3 text-center">
              <button
                onClick={stopPauseTimer}
                className="bg-orange-800 hover:bg-orange-900 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Skip Rest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Details Popup Modal */}
      {showDetailsFor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const exercise = workoutData.exercise.find(ex => ex.exerciseId === showDetailsFor);
              if (!exercise) return null;

              return (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">
                      {exercise.name || `Exercise ${exercise.exerciseId}`}
                    </h2>
                    <button
                      onClick={() => setShowDetailsFor(null)}
                      className="text-gray-400 hover:text-white text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    {/* Exercise GIF */}
                    <div className="mb-6 flex justify-center">
                      <div className="w-64 h-64 bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={exercise.gifUrl}
                          alt={exercise.name || 'Exercise'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Exercise Details */}
                    <div className="space-y-4">
                      {exercise.description && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                          <p className="text-gray-300 leading-relaxed">{exercise.description}</p>
                        </div>
                      )}

                      {exercise.instructions && exercise.instructions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
                          <ol className="text-gray-300 space-y-2">
                            {exercise.instructions.map((instruction, index) => (
                              <li key={index} className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                                  {index + 1}
                                </span>
                                <span className="leading-relaxed">{instruction}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Exercise Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {exercise.target && (
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Primary Target</h4>
                            <p className="text-gray-300 capitalize">{exercise.target}</p>
                          </div>
                        )}
                        {exercise.equipment && (
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Equipment</h4>
                            <p className="text-gray-300 capitalize">{exercise.equipment}</p>
                          </div>
                        )}
                        {exercise.bodyPart && (
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Body Part</h4>
                            <p className="text-gray-300 capitalize">{exercise.bodyPart}</p>
                          </div>
                        )}
                        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Secondary Muscles</h4>
                            <p className="text-gray-300 capitalize">{exercise.secondaryMuscles.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      {/* Workout Parameters */}
                      <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg mt-6">
                        <h4 className="text-white font-semibold mb-2">Today's Workout</h4>
                        <div className="text-gray-300">
                          <span className="font-medium">{exercise.sets} sets</span> ×
                          <span className="font-medium"> {exercise.reps} reps</span> @
                          <span className="font-medium"> {exercise.weight}kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExercisingPlan;
