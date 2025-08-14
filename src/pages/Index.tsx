import EffectsHub from '@/components/EffectsHub';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="relative">
      <EffectsHub />
      <nav className="pointer-events-auto fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        <Link to="/dev-3d" className="inline-flex items-center rounded-full border bg-background/70 backdrop-blur px-4 py-2 text-sm shadow hover:opacity-90 transition">
          3D Dev Area
        </Link>
        <Link to="/lava-lamp" className="inline-flex items-center gap-2 rounded-full border bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm shadow hover:opacity-90 transition">
          <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          Lava Lamp 3D
        </Link>
      </nav>
    </div>
  );
};

export default Index;
