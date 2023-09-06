import React, { FC, useEffect } from 'react';
import ShareIcon from '../assets/Share-icon.png';

const ShareButton: FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.addtoany.com/menu/page.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <button
      type="button"
      className="a2a_dd text-black bg-white rounded-[0.7rem] flex items-center justify-center py-3 px-5 nftItem-shadow"
    >
      <img src={ShareIcon} alt="Pricetag-icon" className="w-[22px]" />
    </button>
  );
};

export default ShareButton;
