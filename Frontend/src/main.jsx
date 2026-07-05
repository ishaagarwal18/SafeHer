<<<<<<< HEAD
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(

<BrowserRouter>

<App/>

</BrowserRouter>

);
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
>>>>>>> 638ded2b3cfbe47f6a9e7fe38770d4a478977c07
