import { useState, useEffect } from 'react';
import checkAuth from '../data/checkAuth';
import { useNavigate } from 'react-router';
import { setCookie, getCookie, deleteCookie } from '../utils/cookieUtils';
import capitalizeWords from '../utils/helpers';

function ExercisingPlan() {
  const navigate = useNavigate();

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
  const [exerciseCache, setExerciseCache] = useState({}); // Cache for fetched exercise data
  // Pause timer state
  const [pauseTimer, setPauseTimer] = useState({
    isActive: false,
    remainingTime: 0,
    exerciseId: null,
    exerciseName: ''
  });

  // Fetch exercise data by ID to get current gifUrl
  const fetchExerciseById = async exerciseId => {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${BACKEND_URL}/exercises/exercise/${exerciseId}`);
      if (response.ok) {
        const exerciseData = await response.json();
        return exerciseData;
      }
    } catch (error) {
      console.error(`Error fetching exercise ${exerciseId}:`, error);
    }
    return null;
  };

  // Fetch all exercises for the workout to cache their current data
  const fetchAllExercises = async exercises => {
    const cache = {};
    const fetchPromises = exercises.map(async exercise => {
      const exerciseData = await fetchExerciseById(exercise.exerciseId);
      if (exerciseData) {
        cache[exercise.exerciseId] = exerciseData;
      }
    });

    await Promise.all(fetchPromises);
    setExerciseCache(cache);
  };

  const getData = async () => {
    try {
      setIsLoading(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      const exerciseId = getCookie('exerciseId');
      const userId = getCookie('userId');
      // console.log(userId, exerciseId);
      // Clear all workout-related cookies but preserve user session
      const allCookies = document.cookie.split(';');
      allCookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('workout_session_') || name === 'deleteId') {
          deleteCookie(name);
        }
      });
      setCookie('exerciseId', exerciseId);
      setCookie('userId', userId);
      const res = await fetch(`${BACKEND_URL}/plans/${exerciseId}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch workout plan');
      }

      const data = await res.json();
      setWorkoutData(data);

      // Fetch all exercise data for current gifUrls
      if (data && data.exercise) {
        await fetchAllExercises(data.exercise);
      }

      return data;
    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      const login = await checkAuth();
      if (!login) {
        alert('User not login');
        navigate('/signin');
      }
    };
    verifyUser();
  }, []);

  // Initialize or restore workout session
  useEffect(() => {
    const initializeWorkout = async () => {
      // Clear all workout-related cookies
      localStorage.clear();
      // Fetch workout data first
      const data = await getData();

      if (!data) {
        console.error('Failed to fetch workout data');
        return;
      }

      const sessionKey = `workout_session_${data._id}`;
      setCookie('deleteId', sessionKey);
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
        // console.log(data.exercise, data);
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

  // Get default weight/reps for a set from setDetails or fallback
  const getSetDefaults = (exercise, setNumber) => {
    // Look for setDetails first (new structure)
    if (exercise.setDetails && exercise.setDetails.length > 0) {
      const setDetail = exercise.setDetails.find(detail => detail.setNumber === setNumber);
      if (setDetail) {
        return { weight: setDetail.weight, reps: setDetail.reps };
      }
    }

    // Fallback to old structure or defaults
    return {
      weight: exercise.weight || 0,
      reps: exercise.reps || 0
    };
  };

  // Get exercise details from exerciseDetails array (new structure) or cached data
  const getExerciseDetails = exercise => {
    // First check if we have cached data from the API
    const cachedExercise = exerciseCache[exercise.exerciseId];
    if (cachedExercise) {
      return {
        name: cachedExercise.name,
        description: cachedExercise.description,
        gifUrl: cachedExercise.gifUrl, // Use current gifUrl from API
        target: cachedExercise.target,
        equipment: cachedExercise.equipment,
        bodyPart: cachedExercise.bodyPart,
        secondaryMuscles: cachedExercise.secondaryMuscles,
        instructions: cachedExercise.instructions
      };
    }

    // Fallback to exercise details from plan data
    if (exercise.exerciseDetails && exercise.exerciseDetails.length > 0) {
      return exercise.exerciseDetails[0]; // Take the first (and likely only) exercise details
    }

    // Fallback to old structure if exerciseDetails doesn't exist
    return {
      name: exercise.name,
      description: exercise.description,
      gifUrl: '', // Empty gifUrl as fallback
      target: exercise.target,
      equipment: exercise.equipment,
      bodyPart: exercise.bodyPart,
      secondaryMuscles: exercise.secondaryMuscles,
      instructions: exercise.instructions
    };
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
      const setDefaults = getSetDefaults(currentExercise, setNumber);

      const completedSet = {
        exerciseId: exerciseId,
        setNumber: setNumber,
        weight: setData.weight || setDefaults.weight,
        reps: setData.reps || setDefaults.reps,
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
  const finishWorkout = async () => {
    setIsTimerRunning(false);
    const completedAt = new Date().toISOString();
    updateSession({
      completedAt: completedAt
    });

    // Create workout log
    await createWorkoutLog(completedAt);

    // Check if user wants to update the plan with workout results
    const shouldUpdatePlan = confirm(
      '🎉 Workout completed! Would you like to update your plan with the weights and reps you just completed?'
    );

    if (shouldUpdatePlan) {
      await updatePlanFromWorkout();
    } else {
      alert('🎉 Workout completed! Great job!');
    }

    // Clean up storage
    const deleteId = getCookie('deleteId');
    localStorage.clear();
    deleteCookie('exerciseId');
    deleteCookie('deleteId');
    navigate('/plans');
  };

  // Create workout log
  const createWorkoutLog = async completedAt => {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      const userId = getCookie('userId');

      if (!workoutSession || !workoutData) {
        console.error('Missing workout session or data for logging');
        return;
      }

      // Calculate workout duration in seconds
      const startTime = new Date(workoutSession.startTime);
      const endTime = new Date(completedAt);
      const duration = Math.floor((endTime - startTime) / 1000);

      // Prepare exercises data with completion info
      const exercises = workoutData.exercise.map(exercise => {
        const exerciseDetails = getExerciseDetails(exercise);
        const completedSetsForExercise =
          workoutSession.completedSets?.filter(set => set.exerciseId === exercise.exerciseId) || [];

        return {
          exerciseId: exercise.exerciseId,
          name: exerciseDetails.name,
          bodyPart: exerciseDetails.bodyPart,
          equipment: exerciseDetails.equipment,
          target: exerciseDetails.target,
          totalSetsCompleted: completedSetsForExercise.length,
          plannedSets: exercise.sets,
          plannedReps: exercise.reps,
          plannedWeight: exercise.weight
        };
      });

      const logData = {
        userId: userId,
        planId: workoutData._id,
        workoutId: workoutData._id, // Same as planId but matches localStorage structure
        workoutSessionId: workoutSession.workoutSessionId,
        startTime: workoutSession.startTime,
        completedAt: completedAt,
        duration: duration,
        currentExerciseIndex: workoutSession.currentExerciseIndex || 0,
        completedSets: workoutSession.completedSets || [],
        setInputs: workoutSession.setInputs || {},
        collapsedExercises: workoutSession.collapsedExercises || {},
        exercises: exercises,
        planName: workoutData.name,
        isPublic: workoutData.isPublic || false
      };

      console.log('Creating workout log:', logData);

      const response = await fetch(`${BACKEND_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create workout log');
      }

      const createdLog = await response.json();
      console.log('Workout log created successfully:', createdLog);
    } catch (error) {
      console.error('Error creating workout log:', error);
      // Don't prevent workout completion if logging fails
      alert('⚠️ Workout completed but failed to save log. Your progress is still saved!');
    }
  };

  // Abort workout and go back to plans
  const abortWorkout = () => {
    const confirmAbort = confirm('Are you sure you want to abort this workout? Your progress will be lost.');
    if (confirmAbort) {
      // Clear cookies like in finishWorkout
      const deleteId = getCookie('deleteId');
      deleteCookie(deleteId);
      deleteCookie('exerciseId');
      deleteCookie('deleteId');
      localStorage.clear();

      // Navigate back to plans
      navigate('/plans');
    }
  };

  // Update plan with workout results
  const updatePlanFromWorkout = async () => {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      // Group completed sets by exercise and prepare update data
      const exerciseUpdates = [];
      const exerciseGroups = {};

      // Group completed sets by exercise
      workoutSession.completedSets.forEach(completedSet => {
        if (!exerciseGroups[completedSet.exerciseId]) {
          exerciseGroups[completedSet.exerciseId] = [];
        }
        exerciseGroups[completedSet.exerciseId].push(completedSet);
      });

      // Create update data for each exercise
      Object.keys(exerciseGroups).forEach(exerciseId => {
        const sets = exerciseGroups[exerciseId];
        const setUpdates = sets.map(set => ({
          setNumber: set.setNumber,
          weight: parseFloat(set.weight) || 0,
          reps: parseInt(set.reps) || 0
        }));

        exerciseUpdates.push({
          exerciseId,
          setUpdates
        });
      });

      const response = await fetch(`${BACKEND_URL}/plans/${workoutData._id}/update-from-workout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exerciseUpdates,
          completedSets: workoutSession.completedSets
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      // alert('✅ Plan updated successfully with your workout results!');
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('❌ Failed to update plan. Your workout is still saved!');
    }
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
      const exerciseDetails = getExerciseDetails(exercise);
      setPauseTimer({
        isActive: true,
        remainingTime: exercise.restTime,
        exerciseId: exerciseId,
        exerciseName: capitalizeWords(exerciseDetails.name) || `Exercise ${exerciseId}`
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
  const currentExerciseDetails = getExerciseDetails(currentExercise);
  const currentExerciseName = currentExerciseDetails.name || `Exercise ${currentExercise.exerciseId}`;

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 pt-safe">
      {/* Header */}
      <div className=" p-3 mb-3">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">{workoutData.name}</h1>
        </div>
      </div>

      {/* Fixed Timer & Date Bar - Hide when exercise details are shown */}
      {!showDetailsFor && (
        <div className="sticky top-15 z-1000 bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-lg p-4 mb-6 border border-gray-700 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-300">
              <span className="flex items-center gap-1">{new Date().toLocaleDateString()}</span>
              <div className="flex">
                <img src="/time.png" alt="timer icon" className="w-4 h-4 inline-block mt-1 mr-2" />
                <span className="flex items-center gap-1">{formatTime(timer)}</span>
              </div>
            </div>
            <button
              onClick={abortWorkout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* All Exercises in Order */}
      <div className="space-y-4">
        {workoutData.exercise.map((exercise, index) => {
          const exerciseDetails = getExerciseDetails(exercise);
          const exerciseName = capitalizeWords(exerciseDetails.name) || `Exercise ${exercise.exerciseId}`;
          const isCurrent = index === currentExerciseIndex;
          const isCollapsed = collapsedExercises[exercise.exerciseId];
          const exerciseCompleted = isExerciseCompleted(exercise.exerciseId);

          return (
            <div
              key={exercise._id}
              className="rounded-lg border bg-[#1a1a1a] border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl"
            >
              {/* Exercise Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-600/20 transition-colors"
                onClick={() => toggleExerciseCollapse(exercise.exerciseId)}
              >
                {/* Exercise Image */}
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {exerciseDetails.gifUrl ? (
                    <img
                      src={exerciseDetails.gifUrl}
                      alt={exerciseDetails.name || 'Exercise'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-500 rounded-lg"></div>
                  )}
                </div>
                {/* Exercise Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white">{exerciseName}</h3>
                    </div>
                    {!isCollapsed && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setShowDetailsFor(showDetailsFor === exercise.exerciseId ? null : exercise.exerciseId);
                        }}
                        className="bg-[#1a1a1a] border border-gray-600 hover:border-[#F2AB40] hover:bg-[#F2AB40] hover:text-black text-white text-xs px-3 py-1 rounded-full transition-colors font-semibold"
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
                    const setDefaults = getSetDefaults(exercise, setNumber);
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

                    // Get previous data - either from setDetails or completed sets from last workout
                    const previousWeight = setDefaults.weight;
                    const previousReps = setDefaults.reps;

                    return (
                      <div
                        key={setNumber}
                        className={`grid grid-cols-5 gap-2 p-2 rounded transition-colors ${
                          isLastCompletedSet
                            ? 'bg-[#2a2a2a]' // Lighter background for most recent completed set
                            : 'bg-[#1a1a1a]'
                        } ${isSetCompleted ? 'opacity-80' : ''}`}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2a2a2a] border border-gray-600 text-white font-semibold">
                          {setNumber}
                        </span>
                        <span className="text-gray-400 flex items-center text-sm">
                          {previousWeight}kg × {previousReps}
                        </span>
                        <input
                          type="number"
                          value={setData.weight || setDefaults.weight}
                          onChange={e => handleInputChange(exercise.exerciseId, setNumber, 'weight', e.target.value)}
                          className="bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1 text-center text-white focus:border-[#F2AB40] focus:outline-none transition-colors"
                          step="0.5"
                          min="0"
                        />
                        <input
                          type="number"
                          value={setData.reps || setDefaults.reps}
                          onChange={e => handleInputChange(exercise.exerciseId, setNumber, 'reps', e.target.value)}
                          className="bg-[#1a1a1a] border border-gray-600 rounded px-2 py-1 text-center text-white focus:border-[#F2AB40] focus:outline-none transition-colors"
                          min="1"
                          max="99"
                        />
                        <button
                          onClick={() => toggleSetCompletion(exercise.exerciseId, setNumber)}
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                            isSetCompleted
                              ? 'bg-[#F2AB40] border-[#F2AB40] text-black'
                              : 'border-gray-600 hover:border-[#F2AB40] hover:bg-[#F2AB40]/20'
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
            canFinishWorkout
              ? 'bg-[#F2AB40] hover:bg-[#e09b2d] text-black'
              : 'bg-[#1a1a1a] border border-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canFinishWorkout ? '🏁 Finish Workout' : '🏁 Complete some sets to finish'}
        </button>
      </div>

      {/* Sticky Pause Timer - Bottom */}
      {pauseTimer.isActive && (
        <div className="fixed bottom-20 -left-5 right-0 z-40 w-[110vw]">
          <div className="bg-gradient-to-br from-[#F2AB40] to-[#e09c37] p-4 px-5 pb-5 backdrop-blur-sm shadow-lg mx-4">
            {/* Skip Rest Button */}
            <div className=" text-center absolute -top-5 ">
              <button
                onClick={stopPauseTimer}
                className="bg-white  text-black px-5 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                Skip
              </button>
            </div>
            <div className="flex items-center justify-between">
              {/* Decrease Timer Button */}
              <button
                onClick={() => adjustPauseTimer(-10)}
                className="bg-black/20 hover:text-[#F2AB40] text-white px-4 py-2 rounded-lg transition-colors font-bold"
              >
                - 10s
              </button>

              {/* Timer Display */}
              <div className="flex-1 text-center">
                <div className="text-white text-sm font-medium ">Rest Time</div>
                <div className="text-white text-3xl font-bold drop-shadow-lg">
                  {formatTime(pauseTimer.remainingTime)}
                </div>
                {/* <div className="text-white/80 text-xs">{pauseTimer.exerciseName}</div> */}
              </div>

              {/* Increase Timer Button */}
              <button
                onClick={() => adjustPauseTimer(10)}
                className="bg-black/20 hover:text-[#F2AB40] text-white px-4 py-2 rounded-lg transition-colors font-bold"
              >
                + 10s
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Details Popup Modal */}
      {showDetailsFor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 mt-5 p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl max-w-2xl w-full max-h-[88vh] overflow-y-auto border border-gray-700 shadow-2xl">
            {(() => {
              const exercise = workoutData.exercise.find(ex => ex.exerciseId === showDetailsFor);
              if (!exercise) return null;

              const exerciseDetails = getExerciseDetails(exercise);

              return (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-600">
                    <h2 className="text-2xl font-bold text-white">
                      {capitalizeWords(exerciseDetails.name) || `Exercise ${exercise.exerciseId}`}
                    </h2>
                    <button
                      onClick={() => setShowDetailsFor(null)}
                      className="text-gray-400 hover:text-[#F2AB40] text-2xl font-bold transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    {/* Exercise GIF */}
                    <div className="mb-6 flex justify-center">
                      <div className="w-64 h-64 bg-[#1a1a1a] border border-gray-600 rounded-lg overflow-hidden">
                        {exerciseDetails.gifUrl ? (
                          <img
                            src={exerciseDetails.gifUrl}
                            alt={exerciseDetails.name || 'Exercise'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">No image available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Exercise Details */}
                    <div className="space-y-4">
                      {exerciseDetails.description && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                          <p className="text-gray-300 leading-relaxed">{exerciseDetails.description}</p>
                        </div>
                      )}

                      {exerciseDetails.instructions && exerciseDetails.instructions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
                          <ol className="text-gray-300 space-y-2">
                            {exerciseDetails.instructions.map((instruction, index) => (
                              <li key={index} className="flex items-start">
                                <span className="bg-[#F2AB40] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
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
                        {exerciseDetails.target && (
                          <div className="bg-[#1a1a1a] border border-gray-600 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Primary Target</h4>
                            <p className="text-gray-300 capitalize">{exerciseDetails.target}</p>
                          </div>
                        )}
                        {exerciseDetails.equipment && (
                          <div className="bg-[#1a1a1a] border border-gray-600 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Equipment</h4>
                            <p className="text-gray-300 capitalize">{exerciseDetails.equipment}</p>
                          </div>
                        )}
                        {exerciseDetails.bodyPart && (
                          <div className="bg-[#1a1a1a] border border-gray-600 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Body Part</h4>
                            <p className="text-gray-300 capitalize">{exerciseDetails.bodyPart}</p>
                          </div>
                        )}
                        {exerciseDetails.secondaryMuscles && exerciseDetails.secondaryMuscles.length > 0 && (
                          <div className="bg-[#1a1a1a] border border-gray-600 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-1">Secondary Muscles</h4>
                            <p className="text-gray-300 capitalize">{exerciseDetails.secondaryMuscles.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      {/* Workout Parameters */}
                      <div className="bg-gradient-to-r from-[#F2AB40]/20 to-[#e09b2d]/20 border border-[#F2AB40]/30 p-4 rounded-lg mt-6">
                        <h4 className="text-white font-semibold mb-2">Today's Workout</h4>
                        <div className="text-gray-300">
                          <div className="font-medium mb-2">{exercise.sets} sets</div>
                          {exercise.setDetails && exercise.setDetails.length > 0 ? (
                            <div className="space-y-1">
                              {exercise.setDetails.map((setDetail, index) => (
                                <div key={index} className="text-sm">
                                  Set {setDetail.setNumber}:{' '}
                                  <span className="font-medium">
                                    {setDetail.weight}kg × {setDetail.reps} reps
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium">{exercise.reps} reps</span> @
                              <span className="font-medium"> {exercise.weight}kg</span> (all sets)
                            </div>
                          )}
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
