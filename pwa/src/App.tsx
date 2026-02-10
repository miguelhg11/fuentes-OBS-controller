import React from 'react';
import { useStore } from './state/store';
import { ConnectionScreen } from './components/ConnectionScreen';
import { ControlPanel } from './components/ControlPanel';

function App() {
    const { isConnected } = useStore();

    return (
        <div className="h-full w-full max-w-md mx-auto overflow-hidden relative shadow-2xl">
            {isConnected ? <ControlPanel /> : <ConnectionScreen />}
        </div>
    );
}

export default App;
