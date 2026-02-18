import { useGameStore } from './store/gameStore';
import MainScreen from './pages/MainScreen';
import ModeSelectScreen from './pages/ModeSelectScreen';
import GameScreen from './pages/GameScreen';
import ResultScreen from './pages/ResultScreen';

function App() {
  const phase = useGameStore((s) => s.phase);

  const renderScreen = () => {
    switch (phase) {
      case 'mode_select':
        return <ModeSelectScreen />;
      case 'playing':
        return <GameScreen />;
      case 'result':
        return <ResultScreen />;
      default: // 'main'
        return <MainScreen />;
    }
  };

  // key={phase} → phase 변경마다 re-mount → screen-enter 애니메이션 재실행
  return (
    <div key={phase} className="screen-enter min-h-screen">
      {renderScreen()}
    </div>
  );
}

export default App;
