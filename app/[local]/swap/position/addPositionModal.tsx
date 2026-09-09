'use client';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function AddPositionModal() {
	return (
		<Dialog open={true}>
			<DialogTitle>Add Position</DialogTitle>
			<DialogContent>{/* Add your form or modal content here */}</DialogContent>
			<DialogActions>
				<Button>Cancel</Button>
				<Button>Add</Button>
			</DialogActions>
		</Dialog>
	);
}
