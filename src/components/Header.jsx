import React from 'react';
import logo from '../assets/succinct-logo.png'; 

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Logo" className="logo" />
      <h1>Generate Your Custom Banner for Succinct Summer</h1>
    </header>
  );
}

export default Header;