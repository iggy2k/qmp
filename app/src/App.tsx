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
          className="bg-blue-300"
        >
          Send
        </button>
      </div>
    </div >
  );
}

export default App;
