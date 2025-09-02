import React, { useState } from "react";
import { useAICopilotStore } from "../../hooks/useAICopilotStore";
import { useVentures } from "../../hooks/useVentures";
import { useAutobuild } from "../../hooks/useAutobuild";
import VentureCardsFlow from "../venture/VentureCardsFlow";

/**
 * New Venture Modal
 * - Toggle between AI Chat and Quick Setup
 * - AI Chat shows chat interface directly in modal
 * - Quick Setup shows step-by-step venture creation flow
 */
const NewVentureModal = ({ isOpen, onClose, onCreateVenture }) => {
  console.log('NewVentureModal: Component starting, isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('NewVentureModal: Not open, returning null');
    return null;
  }
  
  console.log('NewVentureModal: About to call useState');
  const [mode, setMode] = React.useState("ai-chat");
  const [input, setInput] = React.useState("");
  console.log('NewVentureModal: useState successful');

   return (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
       <div className="bg-background rounded-xl shadow-xl w-full max-w-lg p-6">
         <h2 className="text-xl font-semibold mb-4">Create New Venture</h2>
         <p>Modal is working! React hooks are functional.</p>
         <div className="mt-4 flex gap-2">
           <button 
             onClick={onClose}
             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
           >
             Close
           </button>
           <button 
             onClick={() => setMode(mode === "ai-chat" ? "quick-setup" : "ai-chat")}
             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
           >
             Toggle Mode: {mode}
           </button>
         </div>
       </div>
     </div>
   );
};

export default NewVentureModal;
