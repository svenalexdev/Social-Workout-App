import capitalizeWords from '../utils/helpers';

// Predefined body parts for filtering
const allBodyparts = [
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
];

const BodypartFilter = ({ selectedBodyparts, onSelect, onRemove }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 pb-2 mb-2" style={{ minWidth: 'max-content' }}>
        {allBodyparts.map(part => {
          const selected = selectedBodyparts.includes(part);
          return (
            <button
              key={part}
              onClick={() => (selected ? onRemove(part) : onSelect(part))}
              className={`flex items-center px-3 py-1 rounded-full border transition-colors whitespace-nowrap flex-shrink-0
                      ${
                        selected
                          ? 'bg-[#F2AB40] text-black border-[#F2AB40]'
                          : 'bg-gray-700 text-gray-200 border-gray-500 hover:bg-[#F2AB40] hover:text-black'
                      }`}
            >
              <span>{capitalizeWords(part)}</span>
              {selected && <span className="ml-2 font-bold text-black">x</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BodypartFilter;
