import React from "react";
import Navbar from "../components/Common/NavBar";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-7xl font-serif text-gray-900 leading-tight mb-6">
            Learning Management System
          </h1>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            A modern platform for educators and learners to connect, share
            knowledge, and grow together.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition-colors">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 text-sm tracking-wide border-2 border-gray-900 hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
