'use client';

import React from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import logo from '../../../../public/icons/logo.svg';

const Logo = () => {
  return (
    <Image onMouseDown={() => redirect('/')} src={logo} alt="Logo" className="cursor-pointer" />
  );
};

export default Logo;
