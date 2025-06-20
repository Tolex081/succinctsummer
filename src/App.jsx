import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import TemplateSelector from './components/TemplateSelector';
import UserInput from './components/UserInput';
import BannerPreview from './components/BannerPreview';

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [pfp, setPfp] = useState(null);
  const [xUsername, setXUsername] = useState('');

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <TemplateSelector setSelectedTemplate={setSelectedTemplate} />
        <UserInput setPfp={setPfp} setXUsername={setXUsername} />
        <BannerPreview selectedTemplate={selectedTemplate} pfp={pfp} xUsername={xUsername} />
      </div>
    </div>
  );
}

export default App;