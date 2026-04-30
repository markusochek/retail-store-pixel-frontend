'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import { Home as HomeLucide } from 'lucide-react';

const Home = () => {
  return <HomeLucide onMouseDown={() => redirect('/')} className="cursor-pointer w-8 h-8" />;
};

export default Home;
