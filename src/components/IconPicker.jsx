import './IconPicker.css';

const icons = ['🥑', '🧀', '🥩', '⚫', '🍌', '🍖', '🍗', '🤍', '🟡', '🍳', '🦈', '🥟', '🥖', '🥤', '💧', '☕', '🧃'];

// eslint-disable-next-line react/prop-types
const IconPicker = ({ newItem, onSelectIcon }) => {
  return (
    <div className="icon-picker-container">
      {icons.map((icon, index) => (
        // eslint-disable-next-line react/prop-types
        <div key={index} className={`icon-wrapper mb-2 ${newItem?.icon === icon && 'bg-light-green'}`} onClick={() => onSelectIcon(icon)}>
          {icon}
        </div>
      ))}
    </div>
  );
};

export default IconPicker;
