import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css';
import Header from './Components/Layout/Header'
import Cover from './Components/Layout/Cover'
import Footer from './Components/Layout/Footer'
import ForSale from './Pages/for-sale';
import ToRent from './Pages/to-rent';
import Owned from './Pages/owned';
import Renting from './Pages/renting';
import About from './Pages/about';
import CreateItem from './Pages/create-item';
import AllProperties from './Pages/all-properties';
import Exclusive from './Pages/exclusive-properties';

function App() {
  return (
    <div className='bgcolour h-screen flex flex-col overflow-hidden'>      
      <div className="flex-1 overflow-y-auto">
        <BrowserRouter>
        <Header /> 
          <Routes>
            <Route path="/" element={<Cover />} />
            <Route path="/all-properties" element={<AllProperties />} />
            <Route path="/for-sale" element={<ForSale />} />
            <Route path="/to-rent" element={<ToRent />} />
            <Route path="/owned" element={<Owned />} />
            <Route path="/renting" element={<Renting />} />
            <Route path="/exclusive" element={<Exclusive />} />
            <Route path="/about" element={<About />} />
            <Route path="/create-item" element={<CreateItem />} />
          </Routes>      
        </BrowserRouter>
      </div>
      <Footer />
    </div>
  )
}

export default App;
