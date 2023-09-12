import React, { FC, useEffect } from 'react';
import ShareIcon from '../assets/Share-icon.png';
import { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";

import { FaTwitter, FaClipboard } from 'react-icons/fa';

const ShareButton = () => {
  const [showIcons, setShowIcons] = useState(false);

  const handleButtonClick = () => {
    setShowIcons(!showIcons);
  };

  const handleCopyClick = () => {
    try{
      navigator.clipboard.writeText(window.location.href).then(() => {
        // You can perform additional actions when the URL is copied if needed
      });
      toast.success('successfully copied to clipboard');
    }
   catch(e){
      console.error('error in copying',e)

   }
  };

  const handleTwitterClick = () => {
    // Open a new tab/window to share the current URL on Twitter
    const twitterShareUrl = `https://twitter.com/share?url=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(twitterShareUrl, '_blank');
  };

  return (
    <div className="relative inline-block">
      <button
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black"
        onClick={handleButtonClick}
      >
        <img src={ShareIcon} alt="Pricetag-icon" className="w-6" />
      </button>

      {showIcons && (
        <div className="absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-md p-2 shadow-lg flex space-x-2 z-200">
          <button
            className="w-8 h-8 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-[#8652FF]"
            onClick={handleTwitterClick}
          >
            <FaTwitter />
          </button>
          <button
            className="w-8 h-8 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-[#8652FF]"
            onClick={handleCopyClick}
          >
            <FaClipboard />
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
