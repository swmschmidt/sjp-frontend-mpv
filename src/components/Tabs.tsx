import { useState } from 'react';

interface TabsProps {
  labels: string[];
  onTabChange: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ labels, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (index: number) => {
    setActiveTab(index);
    onTabChange(index);
  };

  return (
    <div className="tab-buttons">
      {labels.map((label, index) => (
        <button
          key={label}
          onClick={() => handleClick(index)}
          className={`tab-button ${activeTab === index ? 'active' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
