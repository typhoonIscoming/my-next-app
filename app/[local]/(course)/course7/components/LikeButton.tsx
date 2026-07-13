// components/LikeButton.tsx
'use client';
import { useState } from 'react';

export default function LikeButton({
    initialCount = 0,
}: {
    initialCount?: number;
}) {
    const [count, setCount] = useState(initialCount);
    return (
        <button
            onClick={() => setCount((c) => c + 1)}
            className="px-3 py-2 border rounded cursor-pointer"
        >
            👍 点赞 {count}
        </button>
    );
}
