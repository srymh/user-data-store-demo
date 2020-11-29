import React from 'react';
import logo from './logo.svg';
import './App.css';

const myIpcRenderer = window.myIpcRenderer;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
        <button
          style={{
            color: '#61dafb',
            backgroundColor: '#282c34',
            border: '2px solid white',
            borderRadius: '3px 3px',
            marginTop: '50px',
            cursor: 'pointer',
          }}
          onClick={() => {
            myIpcRenderer
              .invoke('APP_hello', 'ping')
              .then((message) => {
                alert(`Received "${message}" from the main process`);
              })
              .catch((error) => {
                alert(error);
              });
          }}>
          Send "ping" to a main process
        </button>
      </header>
    </div>
  );
}

export default App;
