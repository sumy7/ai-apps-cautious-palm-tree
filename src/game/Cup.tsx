import { motion } from 'framer-motion';
import type { Cup as CupType, LiquidColor } from './types';
import { COLOR_HEX, MAX_LAYERS } from './types';
import { isCupLocked } from './store';

interface CupProps {
  cup: CupType;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function Cup({ cup, isSelected, onClick, index }: CupProps) {
  const isLocked = isCupLocked(cup);
  
  // Create array of 4 layers for display
  const layers: (LiquidColor | null)[] = [];
  for (let i = 0; i < MAX_LAYERS; i++) {
    layers.push(cup[i] || null);
  }

  return (
    <motion.div
      className={`cup-container ${isLocked ? 'locked' : ''}`}
      onClick={isLocked ? undefined : onClick}
      initial={{ scale: 1 }}
      animate={{
        scale: isSelected ? 1.1 : 1,
        y: isSelected ? -10 : 0,
      }}
      whileHover={isLocked ? undefined : { scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className={`cup ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`} data-index={index}>
        <div className="cup-inner">
          {layers.map((color, layerIndex) => (
            <motion.div
              key={layerIndex}
              className="liquid-layer"
              initial={false}
              animate={{
                backgroundColor: color ? COLOR_HEX[color] : 'transparent',
                opacity: color ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
              style={{
                borderBottom: layerIndex < MAX_LAYERS - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            />
          ))}
        </div>
        {isLocked && <div className="cup-lock-icon">🔒</div>}
      </div>
    </motion.div>
  );
}
