'use client';

import { useEffect, useState } from 'react';

export default function ClientTime() {
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        setTime(new Date().toLocaleTimeString());
    }, []);

    if (!time) return <span className="text-gray-300">Loading time...</span>;

    return <span>{time}</span>;
}
