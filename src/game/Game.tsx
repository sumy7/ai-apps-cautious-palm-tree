import { useGameStore } from './store';
import { Cup } from './Cup';
import { motion, AnimatePresence } from 'framer-motion';

export function Game() {
  const { cups, selectedCupIndex, selectCup, reset, undo, shuffle, moveHistory, gameStatus, shuffleCount } = useGameStore();

  return (
    <div className="game-layout">
      {/* Header Section */}
      <header className="game-header">
        <div className="game-title-group">
          <h1 className="game-title">杯子倒水消除游戏</h1>
          <p className="game-subtitle">Water Sort Puzzle</p>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">步数</span>
            <span className="stat-value">{moveHistory.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">杯子</span>
            <span className="stat-value">{cups.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">打散</span>
            <span className="stat-value">{shuffleCount}</span>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Controls */}
      <aside className="game-sidebar">
        <div className="sidebar-panel">
          <div className="panel-header">
            <span className="panel-icon">🎮</span>
            <span className="panel-title">游戏控制</span>
          </div>
          <div className="controls-list">
            <button className="control-btn" onClick={undo} disabled={moveHistory.length === 0}>
              ↩️ 撤销上一步
            </button>
            <button className="control-btn shuffle-btn" onClick={shuffle} disabled={shuffleCount === 0}>
              🎲 打散颜色 ({shuffleCount})
            </button>
            <button className="control-btn reset-btn" onClick={reset}>
              🔄 重新开始
            </button>
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="panel-header">
            <span className="panel-icon">💡</span>
            <span className="panel-title">游戏提示</span>
          </div>
          <ul className="rules-list">
            <li className="rule-item">
              <span className="rule-number">1</span>
              <span>点击选中一个有液体的杯子</span>
            </li>
            <li className="rule-item">
              <span className="rule-number">2</span>
              <span>再点击另一个杯子进行倒水</span>
            </li>
            <li className="rule-item">
              <span className="rule-number">3</span>
              <span>相同颜色才能叠加</span>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="game-main">
        <div className="game-area">
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
        </div>

        {/* Mobile Controls (hidden on PC) */}
        <div className="game-controls">
          <button className="control-btn" onClick={undo} disabled={moveHistory.length === 0}>
            撤销
          </button>
          <button className="control-btn shuffle-btn" onClick={shuffle} disabled={shuffleCount === 0}>
            打散 ({shuffleCount})
          </button>
          <button className="control-btn reset-btn" onClick={reset}>
            重新开始
          </button>
        </div>

        {/* Mobile Rules (hidden on PC) */}
        <div className="game-rules">
          <h3>游戏规则</h3>
          <ul>
            <li>点击一个杯子选中它，再点击另一个杯子将液体倒入</li>
            <li>只能将液体倒入空杯子或顶部颜色相同的杯子</li>
            <li>完成的杯子（4层同色）会自动锁定</li>
            <li>目标：让每个杯子里只有一种颜色的液体</li>
          </ul>
        </div>
      </main>

      {/* Right Sidebar - Rules & Info */}
      <aside className="game-sidebar">
        <div className="sidebar-panel">
          <div className="panel-header">
            <span className="panel-icon">📖</span>
            <span className="panel-title">游戏规则</span>
          </div>
          <ul className="rules-list">
            <li className="rule-item">
              <span className="rule-number">1</span>
              <span>点击一个杯子选中它</span>
            </li>
            <li className="rule-item">
              <span className="rule-number">2</span>
              <span>再点击另一个杯子将液体倒入</span>
            </li>
            <li className="rule-item">
              <span className="rule-number">3</span>
              <span>只能倒入空杯或颜色相同的杯子</span>
            </li>
            <li className="rule-item">
              <span className="rule-number">🏆</span>
              <span>目标：每个杯子只装一种颜色</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-panel">
          <div className="panel-header">
            <span className="panel-icon">📊</span>
            <span className="panel-title">游戏状态</span>
          </div>
          <div className="game-info">
            <p>
              {gameStatus === 'playing' && '游戏进行中...'}
              {gameStatus === 'won' && '🎉 恭喜获胜!'}
              {gameStatus === 'lost' && '😔 无法继续'}
            </p>
          </div>
        </div>
      </aside>

      {/* Win/Lose Modals */}
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
              <h2>🎉 恭喜获胜!</h2>
              <p>You Won!</p>
              <div className="modal-stats">
                <div className="stat-item">
                  <span className="stat-label">总步数</span>
                  <span className="stat-value">{moveHistory.length}</span>
                </div>
              </div>
              <div className="modal-buttons">
                <button className="control-btn" onClick={reset}>
                  🔄 再来一局
                </button>
              </div>
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
              <h2>😔 游戏结束</h2>
              <p>No more moves available!</p>
              <div className="modal-buttons">
                <button className="control-btn" onClick={undo}>
                  ↩️ 撤销
                </button>
                <button className="control-btn reset-btn" onClick={reset}>
                  🔄 重新开始
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
