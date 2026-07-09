import { Suspense } from 'react';

import Content from './components/content';

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Content />
        </Suspense>
    );
}
