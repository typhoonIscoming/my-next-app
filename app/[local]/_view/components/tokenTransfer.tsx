'use client';
import { ClientsProvider } from '../hooks/provider';
import ViewDemo from './viewDemo';

export default () => {
	return (
		<ClientsProvider>
			<div className="bg-gray-100">
				<div className="p-4">
					<ViewDemo />
				</div>
			</div>
		</ClientsProvider>
	);
};
