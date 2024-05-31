import React from 'react';
import carousal2 from './imgs/7618695.jpg';

function HomeSection() {
  return (
    <div id="home" className="pt-24 p-4 text-center">
      <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome to AptiLogic</h1>
        <p className="mb-4 text-lg text-gray-600">
          Master Aptitude and Logical Reasoning Skills with Ease
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <img className="w-full h-96 object-cover" src={carousal2} alt="Aptitude and Logical Reasoning" />
      </div>
    </div>
  );
}

export default HomeSection;
