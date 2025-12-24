import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField  
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import { UserContext } from '@/context/UserContext';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';

interface Props {
  setIsOpen: (isOpen: boolean) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{10,14}$/;

export default function ShareListModal({ setIsOpen }: Props) {
  const { t } = useContext(UserContext);
  const { addListMemberByEmail } = useContext(ShopSmartContext);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [disableSendEmail, setDisableSendEmail] = useState(true);
  const [disableSendWhatsApp, setDisableSendWhatsApp] = useState(true);
  const [invitation, setInvitation] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  useEffect(() => {
    const isValidEmail = emailRegex.test(email.trim());
    setEmailValid(isValidEmail);
    if (isValidEmail && !isLoading) {
      setDisableSendEmail(false);
    } else {
      setDisableSendEmail(true);
    }
  }, [email]);  

  useEffect(() => {
    const isValidPhone = phoneRegex.test(phone.trim());
    if (isValidPhone) {
      setPhoneError('');
      setDisableSendWhatsApp(false);
      return;
    }
    setPhoneError(isValidPhone ? '' : t.invalid_phone || 'Invalid phone number');
    setDisableSendWhatsApp(true);
  }, [phone]);

  const handleAddMember = async () => {
    setError('');
    if (!email.trim() || (!emailValid && !!error)) {
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
        />
        <IconButton
          disabled={disableSendEmail}
          onClick={handleOpenGmail}
          title={t.send_email}
          sx={{
            color: disableSendEmail ? (theme) => theme.palette.action.disabled : '#EA4335',
          }}
        >
          <EmailIcon />
        </IconButton>
        <IconButton
          disabled={disableSendEmail}
          onClick={() => setShowPhoneInput(true)}
          title={t.send_whatsapp}
          sx={{
            color: disableSendEmail ? (theme) => theme.palette.action.disabled : '#25D366',
          }}
        >
          <WhatsAppIcon />
        </IconButton>

        {showPhoneInput && (
          <div className="flex items-center mt-4">
            <Box sx={{ mt: 2 }}>
              <TextField
                label={t.phone_number || 'מספר טלפון'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!phoneError}
                helperText={phoneError || t.phone_hint}
                fullWidth
              />
            </Box>
            <IconButton disabled={disableSendWhatsApp} onClick={handleOpenWhatsApp} title={t.send_whatsapp}>
              <SendIcon  className='-scale-x-100'/>
            </IconButton>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>{t.cancel}</Button>
      </DialogActions>
    </Dialog>
  );
}
