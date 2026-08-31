import Link from 'next/link';
import { Button } from '@/components/ui/button';
import wrapper from './wrapper.module.css';

export default function NotFoundPage() {
	return (
		<div className={wrapper.notFound}>
			<div>404 - Page Not Found</div>
			<div className={wrapper.buttonContainer}>
				<Button asChild variant="default">
					<Link href="/">Go Home</Link>
				</Button>
			</div>
		</div>
	);
}
