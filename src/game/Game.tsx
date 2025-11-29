import { useGameStore } from './store';
import { Cup } from './Cup';
import { motion, AnimatePresence } from 'framer-motion';

export function Game() {
  const { cups, selectedCupIndex, selectCup, reset, undo, moveHistory, gameStatus } = useGameStore();

  return (
    <div className="game-container">
      <h1 className="game-title">杯子倒水消除游戏</h1>
      <p className="game-subtitle">Water Sort Puzzle</p>

      <div className="cups-grid">
        {cups.map((cup, index) => (
          <Cup
            key={index}
            cup={cup}
            index={index}
            isSelected={selectedCupIndex === index}
            onClick={() => selectCup(index)}
          />
        ))}
      </div>

      <div className="game-controls">
        <button className="control-btn" onClick={undo} disabled={moveHistory.length === 0}>
          撤销 (Undo)
        </button>
        <button className="control-btn reset-btn" onClick={reset}>
          重新开始 (Reset)
        </button>
      </div>

      <div className="game-info">
        <p>步数 (Moves): {moveHistory.length}</p>
      </div>

      <AnimatePresence>
        {gameStatus === 'won' && (
          <motion.div
            className="game-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="game-modal win-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <h2>🎉 恭喜获胜! 🎉</h2>
              <p>You Won!</p>
              <p>总步数: {moveHistory.length} 步</p>
              <button className="control-btn" onClick={reset}>
                再来一局 (Play Again)
              </button>
            </motion.div>
          </motion.div>
        )}

        {gameStatus === 'lost' && (
          <motion.div
            className="game-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="game-modal lose-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <h2>😔 游戏结束 😔</h2>
              <p>No more moves available!</p>
              <div className="modal-buttons">
                <button className="control-btn" onClick={undo}>
                  撤销 (Undo)
                </button>
                <button className="control-btn reset-btn" onClick={reset}>
                  重新开始 (Reset)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="game-rules">
        <h3>游戏规则 (Rules)</h3>
        <ul>
          <li>点击一个杯子选中它，再点击另一个杯子将液体倒入</li>
          <li>只能将液体倒入空杯子或顶部颜色相同的杯子</li>
          <li>目标：让每个杯子里只有一种颜色的液体</li>
        </ul>
      </div>
    </div>
  );
}
