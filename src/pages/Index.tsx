import EffectsHub from '@/components/EffectsHub';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="relative">
      <EffectsHub />
      <nav className="pointer-events-auto fixed bottom-4 right-4 z-50">
        <Link to="/dev-3d" className="inline-flex items-center rounded-full border bg-background/70 backdrop-blur px-4 py-2 text-sm shadow hover:opacity-90 transition">
          3D Dev Area
        </Link>
      </nav>
    </div>
  );
};

export default Index;
