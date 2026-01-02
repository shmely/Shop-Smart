import { useContext, useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import { UserContext } from '@/context/UserContext';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';
import { MuiTelInput } from 'mui-tel-input';

interface Props {
  setIsOpen: (isOpen: boolean) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+\d{12,13}$/;

export default function ShareListModal({ setIsOpen }: Props) {
  const { t } = useContext(UserContext);
  const { addListMemberByEmail, activeList } = useContext(ShopSmartContext);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [disableSendEmail, setDisableSendEmail] = useState(true);
  const [disableSendWhatsApp, setDisableSendWhatsApp] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

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
    const cleanPhone = phone.replace(/\s/g, '');
    const isValidPhone = phoneRegex.test(cleanPhone);
    if (isValidPhone && !isSharing) {
      setPhoneError('');
      setDisableSendWhatsApp(false);
      return;
    } else {
      setPhoneError(isValidPhone || cleanPhone.length === 0 ? '' : t.invalid_phone || 'מספר טלפון לא תקין');
      setDisableSendWhatsApp(true);
    }
  }, [phone]);

  const handleAddMember = async () => {
    setError('');
    if (!email.trim() || (!emailValid && !!error)) {
      setError(t.invalid_email || 'אימייל לא תקין');
      return;
    }
    setIsLoading(true);
    const appUrl = window.location.origin;
    const joinLink = `${appUrl}/list/${activeList.id}`;
    const message = `הזמנה להצטרף לרשימה "${activeList?.name}" ב-Shop Smart`;
    try {
      await addListMemberByEmail(email);
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error adding member by email:', err);
        return null;
      }
    } finally {
      setIsLoading(false);
      return {
        subject: message,
        body: joinLink,
      };
    }
  };

  const handleOpenGmail = async () => {
    const invitation = await handleAddMember();
    if (error || !invitation) return;
    const mailto = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(invitation.subject)}&body=${encodeURIComponent(invitation.body)}`;
    window.open(mailto, '_blank');
    setIsOpen(false);
  };

  const handleOpenWhatsApp = async () => {
    if (isSharing || !phone) return;
    if (!phone.trim()) {
      setPhoneError(t.invalid_phone || 'Enter phone number');
      return;
    }

    setIsSharing(true);
    try {
      const invitation = await handleAddMember();
      if (error || !invitation) return;
      setPhoneError('');

      const text = `${invitation.subject}\n\n${invitation.body}`;
      const cleanPhone = phone.replace(/\s/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      console.log('Opening WhatsApp URL:', whatsappUrl);
      window.open(whatsappUrl, '_blank');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      setPhoneError(t.error_sending_whatsapp || 'Error sending WhatsApp message');
    } finally {
      setPhoneError('');
    }
  };
  const handlePhoneChange = (newValue: string) => {
    // newValue is already the string (e.g., "+972501234567")
    setPhone(newValue);
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
              <MuiTelInput
                label={t.phone_number || 'מספר טלפון'}
                value={phone}
                onChange={handlePhoneChange}
                defaultCountry="IL" // Sets Israel as default
                fullWidth
                error={!!phoneError}
                helperText={phoneError || t.phone_hint}
              />
            </Box>
            <IconButton
              disabled={disableSendWhatsApp}
              onClick={handleOpenWhatsApp}
              title={t.send_whatsapp}
              sx={{
                color: disableSendWhatsApp ? (theme) => theme.palette.action.disabled : '#25D366',
              }}
            >
              <SendIcon className="-scale-x-100" />
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
