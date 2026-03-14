import React from "react";
import Hero from "./components/hero";
import FeaturedRooms from "./components/FeaturedRooms";
import Branches from "./components/Branches";
import ServicesSection from "./components/ServicesSection";
import TravelInspiration from "./components/TravelInspiration";

const Home = () => {
  return (
    <div>
      <Hero />
      <FeaturedRooms />
      <Branches />
      <ServicesSection />
      <TravelInspiration />
    </div>
  );
};

export default Home;
