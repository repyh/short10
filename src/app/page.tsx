'use client';

import { useState, useEffect, Suspense } from 'react';
import Main from '@/app/sections/Main';
import { ThemeProvider } from '@/app/context/ThemeContext';

export default function Home() {
    return (
        <ThemeProvider>
            <div className="w-full flex items-center justify-center scroll-smooth">
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <Main />
                </div>
            </div>
        </ThemeProvider>
    );
}
