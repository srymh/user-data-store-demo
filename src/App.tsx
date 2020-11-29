import React from 'react';
import logo from './logo.svg';
import './App.css';
import ElectronStorePane from './components/ElectronStorePane';
import LocalForagePane from './components/LocalForagePane';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div
          style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
          <ElectronStorePane />
          <LocalForagePane />
        </div>
      </header>
    </div>
  );
}

export default App;
