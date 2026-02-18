import { useGameStore } from './store/gameStore';
import MenuScreen from './components/MenuScreen';
import QuizScreen from './components/QuizScreen';
import ReviewScreen from './components/ReviewScreen';
import ResultScreen from './components/ResultScreen';

function App() {
  const phase = useGameStore((s) => s.phase);

  const renderScreen = () => {
    switch (phase) {
      case 'playing':
        return <QuizScreen />;
      case 'review':
        return <ReviewScreen />;
      case 'result':
        return <ResultScreen />;
      default:
        return <MenuScreen />;
    }
  };

  // key={phase} 로 phase 변경 시마다 re-mount → screen-enter 애니메이션 재실행
  return (
    <div key={phase} className="screen-enter min-h-screen">
      {renderScreen()}
    </div>
  );
}

export default App;
