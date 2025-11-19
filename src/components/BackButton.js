import React from "react";
import { ArrowLeft } from "lucide-react";

const BackButton = ({ setCurrentPage }) => {
  return (
    <button
      onClick={() => setCurrentPage("shop")}
      className="flex items-center gap-2 text-gray-700 font-medium mb-6"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>
  );
};

export default BackButton;