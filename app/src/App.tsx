import React, { useEffect, useState } from 'react';

function App() {
  console.log(window.ipcRenderer);

  const [isSent, setSent] = useState(false);
  const [fromMain, setFromMain] = useState<string | null>(null);

  const sendToElectron = () => {
    if (window.Main) {
      window.Main.sendMessage("Message from react");
      setSent(true);
    }
  };

  const collapse = () => {
    if (window.Main) {
      window.Main.Resize();
    }
  };

  useEffect(() => {
    if (isSent && window.Main)
      window.Main.on('message', (message: string) => {
        setFromMain(message);
      });
  }, [fromMain, isSent]);

  return (
    <div>
      <h1 className="bg-green-300">Response: {fromMain}</h1>
      <div className='bg-blue-300'>
        <button
          onClick={sendToElectron}
        >
          Send
        </button>
        <div className="bg-red-300">
          <button
            onClick={collapse}
          >
            Toggle Collapse
          </button>
        </div>
      </div>
    </div >
  );
}

export default App;
