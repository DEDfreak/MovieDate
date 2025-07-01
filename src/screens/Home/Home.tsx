import React from "react";
import { Link } from "react-router-dom";
import { AddDateSection } from "../StitchDesign/sections/AddDateSection";
import { Button } from "../../components/ui/button";

export const Home = (): JSX.Element => {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex flex-col w-full bg-[#211111] min-h-screen">
        <AddDateSection />
        
        <div className="flex justify-center px-40 py-5 w-full flex-1">
          <div className="flex flex-col max-w-[960px] w-[960px] py-5 items-center justify-center">
            <div className="text-center mb-8">
              <h1 className="font-bold text-white text-4xl leading-tight font-['Plus_Jakarta_Sans',Helvetica] mb-4">
                Welcome to CineDate
              </h1>
              <p className="font-normal text-[#c69193] text-lg font-['Plus_Jakarta_Sans',Helvetica] mb-8">
                Plan perfect movie dates and keep track of your cinema experiences
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link to="/add-date">
                <Button className="bg-[#e82833] hover:bg-[#c62229] text-white px-8 py-3 rounded-lg font-bold">
                  Add New Date
                </Button>
              </Link>
              <Link to="/dates">
                <Button className="bg-[#472326] hover:bg-[#472326]/90 text-white px-8 py-3 rounded-lg font-bold">
                  View My Dates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};