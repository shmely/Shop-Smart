import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }: Props) {
  const { t } =useContext(UserContext)
    return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t.cancel}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          {t.yes_delete}
        </Button>
      </DialogActions>
    </Dialog>
  );
}