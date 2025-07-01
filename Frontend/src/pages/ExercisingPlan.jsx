import { useState, useEffect } from 'react';
import { getExercise } from '../utils/fetch';

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

  const getData = async () => {
    try {
      setIsLoading(true);
      const data = await getExercise('6863c0f9f232b632dc50f181');
      setWorkoutData(data);
      return data;
    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exercise name mapping (you can expand this or fetch from backend)
  const exerciseNames = {
    '0001': 'Arnold Press',
    '0002': 'Shoulder Press',
    '0003': 'Push Up'
  };

  // Initialize or restore workout session
  useEffect(() => {
    const initializeWorkout = async () => {
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

  if (!workoutSession || isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!workoutData) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading workout data</div>;
  }

  const currentExercise = workoutData.exercise[currentExerciseIndex];
  const currentExerciseName = exerciseNames[currentExercise.exerciseId] || `Exercise ${currentExercise.exerciseId}`;

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
          const exerciseName = exerciseNames[exercise.exerciseId] || `Exercise ${exercise.exerciseId}`;
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
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <div className="text-gray-600 text-center">
                      <span className="text-2xl">💪</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💪</span>
                  </div>
                )}

                {/* Exercise Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${isCurrent ? 'text-2xl text-white' : 'text-lg'}`}>{exerciseName}</h3>
                    {exerciseCompleted && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Completed</span>
                    )}
                    {isCurrent && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Current</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                  </div>
                </div>

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
                        <select
                          value={setData.reps || exercise.reps}
                          onChange={e => handleInputChange(exercise.exerciseId, setNumber, 'reps', e.target.value)}
                          className="bg-gray-700 rounded px-2 py-1"
                        >
                          {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
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
      <div className="mt-8 mb-6">
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
    </div>
  );
}

export default ExercisingPlan;
