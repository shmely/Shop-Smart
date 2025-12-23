import { useContext, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { UserContext } from '@/context/UserContext';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';

interface Props {
  setIsOpen: (isOpen: boolean) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ShareListModal({ setIsOpen }: Props) {
  const { t } = useContext(UserContext);
  const { addListMemberByEmail } = useContext(ShopSmartContext);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  // State to hold the generated email content
  const [invitation, setInvitation] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: show a small notification that text was copied
  };

  const handleAddMember = async () => {
    setError('');
    if (!email.trim() || !emailRegex.test(email)) {
      setError(t.invalid_email || 'Invalid email address');
      return;
    }
    setIsLoading(true);

    try {
      const result = await addListMemberByEmail(email);
      if (result) {
        const invitation = {
          subject: result.subject || 'Join my shopping list!',
          body: result.body || 'Hi! Join our family shopping list on ShopSmart: [invite link here]',
        };
        setInvitation(invitation);
      } else {
        setError('המשתמש כבר קיבל הזמנה לרשימה זו');
        result;
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGmail = async () => {
    await handleAddMember();
    if (error || !invitation) return;
    const mailto = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(invitation.subject)}&body=${encodeURIComponent(invitation.body)}`;
    window.open(mailto, '_blank');
    setIsOpen(false);
  };

  const handleOpenWhatsApp = async () => {
    await handleAddMember();
    if (error || !invitation) return;
    if (!phone.trim()) {
      setPhoneError(t.invalid_phone || 'Enter phone number');
      return;
    }
    setPhoneError('');
    // WhatsApp expects phone in international format, no + or spaces
    const phoneNumber = phone.replace(/\D/g, '');
    const text = `${invitation.subject}\n\n${invitation.body}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <Dialog open={true} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle>{t.share_list}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label={t.email_address}
          type="email"
          fullWidth
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          helperText={error}
          InputProps={{
            endAdornment: email && emailRegex.test(email) && (
              <InputAdornment position="end">
                <IconButton disabled={isLoading} onClick={handleOpenGmail} title={t.send_email}>
                  <EmailIcon />
                </IconButton>
                <IconButton
                  disabled={!phone || !!phoneError}
                  onClick={() => setShowPhoneInput(true)}
                  title={t.send_whatsapp}
                >
                  <WhatsAppIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {showPhoneInput && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label={t.phone_number || 'Phone Number'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={!!phoneError}
              helperText={phoneError || t.phone_hint}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleOpenWhatsApp} title={t.send_whatsapp}>
                      <WhatsAppIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>{t.cancel}</Button>
      </DialogActions>
    </Dialog>
  );
}
