import { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { UserContext } from '@/context/UserContext';

interface Props {
  setIsOpen: (isOpen: boolean) => void;
}

export default function ShareListModal({ setIsOpen }: Props) {
  const { addListMemberByEmail } = useContext(UserContext);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State to hold the generated email content
  const [emailContent, setEmailContent] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: show a small notification that text was copied
  };

  const handleAddMember = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await addListMemberByEmail(email);
      if (result) {
        // --- User did NOT exist ---
        // Show the convenient copy UI
        setEmailContent(result);
      } else {
        // --- User existed and was added ---
        setIsOpen(false); // Close modal on success
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>Share List</DialogTitle>
      <DialogContent>
        {emailContent ? (
          // --- VIEW 2: Show generated content to copy ---
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              User not found. Please send them this invitation:
            </Typography>
            <TextField
              label="To"
              value={email}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => handleCopyToClipboard(email)}>
                    <ContentCopyIcon />
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Subject"
              value={emailContent.subject}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => handleCopyToClipboard(emailContent.subject)}>
                    <ContentCopyIcon />
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Body (Link)"
              value={emailContent.body}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => handleCopyToClipboard(emailContent.body)}>
                    <ContentCopyIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        ) : (
          // --- VIEW 1: Initial email input ---
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
            helperText={error}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>{emailContent ? 'Close' : 'Cancel'}</Button>
        {!emailContent && (
          <Button onClick={handleAddMember} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Member'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
