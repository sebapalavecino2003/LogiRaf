import { BrowserRouter, Routes, Route } from "react-router-dom";
import Deposito from "./pages/Deposito.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Deposito />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;