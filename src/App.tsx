import React, { useState, useEffect } from "react";
import { Activity, Package, Box, AlertCircle } from "lucide-react";

function App() {
  const [buffer, setBuffer] = useState<string[]>([]);
  const [stats, setStats] = useState({
    produced: 0,
    consumed: 0,
    lost: 0,
  });

  // Production function
  const produceItem = () => {
    setStats((prev) => ({ ...prev, produced: prev.produced + 1 }));
    if (buffer.length < 10) {
      setBuffer((prev) => [...prev, `Item ${stats.produced + 1}`]);
    } else {
      setStats((prev) => ({ ...prev, lost: prev.lost + 1 }));
    }
  };

  // Consumption function
  const consumeItem = () => {
    if (buffer.length > 0) {
      setBuffer((prev) => prev.slice(1));
      setStats((prev) => ({ ...prev, consumed: prev.consumed + 1 }));
    }
  };

  // Simulate production and consumption
  useEffect(() => {
    const producerInterval = setInterval(produceItem, 1000);
    const consumerInterval = setInterval(consumeItem, 1500);
    return () => {
      clearInterval(producerInterval);
      clearInterval(consumerInterval);
    };
  }, []);

  const bufferPercentage = (buffer.length / 10) * 100;
  const bufferColorClass = 
    bufferPercentage >= 80 ? "bg-red-200" :
    bufferPercentage >= 50 ? "bg-yellow-200" :
    "bg-green-200";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            Producer-Consumer Simulation
          </h1>
          <p className="text-gray-600">
            Simulating the classic producer-consumer problem with 1 item/sec production and 1 item/1.5sec consumption
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Buffer Queue</h2>
            </div>
            
            <div className={`rounded-lg p-4 mb-4 transition-colors duration-300 ${bufferColorClass}`}>
              <div className="grid grid-cols-5 gap-2">
                {[...Array(10)].map((_, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm
                      ${buffer[index] ? 'bg-white shadow-sm' : 'bg-gray-100 border-2 border-dashed border-gray-300'}`}
                  >
                    {buffer[index] ? <Box className="h-5 w-5 text-blue-600" /> : null}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Buffer Capacity:</span>
              <span className="font-medium">{buffer.length} / 10</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Statistics</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Produced</span>
                <span className="text-lg font-semibold text-green-700">{stats.produced}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700">Consumed</span>
                <span className="text-lg font-semibold text-blue-700">{stats.consumed}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-700">Lost</span>
                <span className="text-lg font-semibold text-red-700">{stats.lost}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Producer: 1 item/second</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Consumer: 1 item/1.5 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;