import { useGameStore } from './store/gameStore';
import MenuScreen from './components/MenuScreen';
import QuizScreen from './components/QuizScreen';
import ReviewScreen from './components/ReviewScreen';
import ResultScreen from './components/ResultScreen';

function App() {
  const phase = useGameStore((s) => s.phase);

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
}

export default App;
