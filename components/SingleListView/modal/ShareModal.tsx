import React, { useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
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

export default function ShareModal({ setIsOpen }: Props) {
  const { t, user } = useContext(UserContext);
  const { addListMemberByEmail, lists } = useContext(ShopSmartContext);

  // State
  const [shareSpecific, setShareSpecific] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Derived
  const ownedLists = useMemo(() => lists.filter((l) => user && l.ownerId === user.uid), [lists, user]);

  const isEmailValid = emailRegex.test(email.trim());
  const isPhoneValid = phoneRegex.test(phone.replace(/\s/g, ''));

  // --- Handlers ---
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareSpecific(e.target.checked);
    if (!e.target.checked) {
      setSelectedListId(null);
      setEmail('');
      setEmailError('');
    }
  };

  const handleListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedListId(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setPhoneError('');
  };

  // --- Sharing logic ---
  const getShareLinkAndMessage = () => {
    if (shareSpecific && selectedListId) {
      const list = ownedLists.find((l) => l.id === selectedListId);
      if (list) {
        return {
          link: `${window.location.origin}/list/${list.id}`,
          message: `הזמנה להצטרף לרשימה "${list.name}" ב-Shop Smart`,
        };
      }
    }
    return {
      link: window.location.origin,
      message: t.invite_to_app || 'הזמנה ל-Shop Smart',
    };
  };

  const handleAddMemberByEmail = async () => {
    if (!isEmailValid) {
      setEmailError(t.invalid_email || 'אימייל לא תקין');
      return false;
    }
    if (shareSpecific && selectedListId) {
      try {
        setIsLoading(true);
        await addListMemberByEmail(email, selectedListId);
        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        setEmailError(t.error_adding_member || 'שגיאה בהוספת חבר');
        return false;
      }
    }
    return true;
  };

  const handleShareEmail = async () => {
    const { link, message } = getShareLinkAndMessage();
    if (shareSpecific) {
      const ok = await handleAddMemberByEmail();
      if (!ok) return;
    }
    const mailto = `https://mail.google.com/mail/?view=cm&fs=1&to=${shareSpecific ? encodeURIComponent(email) : ''}&su=${encodeURIComponent(message)}&body=${encodeURIComponent(link)}`;
    window.open(mailto, '_blank');
    setIsOpen(false);
  };

  const handleShareWhatsApp = async () => {
    if (!showPhoneInput) {
      setShowPhoneInput(true);
      return;
    }
    if (!isPhoneValid) {
      setPhoneError(t.invalid_phone || 'מספר טלפון לא תקין');
      return;
    }
    if (shareSpecific) {
      const ok = await handleAddMemberByEmail();
      if (!ok) return;
    }
    const { link, message } = getShareLinkAndMessage();
    const text = `${message}\n\n${link}`;
    const cleanPhone = phone.replace(/\s/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  // --- Button enable/disable logic ---
  // Email: enabled if (not sharing specific) OR (sharing specific AND list selected AND email valid AND not loading)
  const isEmailButtonDisabled = isLoading || (shareSpecific && (!selectedListId || !isEmailValid));

  // WhatsApp: enabled if (not sharing specific) OR (sharing specific AND list selected AND email valid AND not loading)
  // (for WhatsApp, we require email valid for member invite, as per your logic)
  const isWhatsAppButtonDisabled = isLoading || (shareSpecific && (!selectedListId || !isEmailValid));

  // Send icon for WhatsApp phone input: enabled if phone valid and not loading
  const isSendPhoneButtonDisabled = isLoading || !isPhoneValid;

  return (
    <Dialog open={true} onClose={() => setIsOpen(false)} fullWidth>
      <DialogTitle sx={{ padding: '16px 30px' }}>{t.share}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <FormControlLabel
          control={<Checkbox checked={shareSpecific} onChange={handleCheckboxChange} />}
          label={t.share_specific_list || 'Share specific list'}
          sx={{ margin: 0 }}
        />

        {/* List selection, disabled unless checkbox checked */}
        <FormControl component="fieldset" sx={{ mt: 2, mb: 2, margin: 0, padding: '9px' }}>
          <FormLabel component="legend">{t.select_list || 'Select a list'}</FormLabel>
          <RadioGroup value={selectedListId} onChange={handleListChange}>
            {ownedLists.map((list) => (
              <FormControlLabel
                key={list.id}
                value={list.id}
                control={<Radio />}
                label={list.name}
                disabled={!shareSpecific}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {shareSpecific && (
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label={t.email_address}
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError}
            disabled={isLoading}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <IconButton
            disabled={isEmailButtonDisabled}
            onClick={handleShareEmail}
            title={t.send_email}
            sx={{
              color: isEmailButtonDisabled ? (theme) => theme.palette.action.disabled : '#EA4335',
            }}
          >
            <EmailIcon />
          </IconButton>
          <IconButton
            disabled={isWhatsAppButtonDisabled}
            onClick={handleShareWhatsApp}
            title={t.send_whatsapp}
            sx={{
              color: isWhatsAppButtonDisabled ? (theme) => theme.palette.action.disabled : '#25D366',
            }}
          >
            <WhatsAppIcon />
          </IconButton>
        </Box>
        {showPhoneInput && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <MuiTelInput
              label={t.phone_number || 'מספר טלפון'}
              value={phone}
              onChange={handlePhoneChange}
              defaultCountry="IL"
              fullWidth
              error={!!phoneError}
              helperText={phoneError || t.phone_hint}
              disabled={isLoading}
            />
            <IconButton
              disabled={isSendPhoneButtonDisabled}
              onClick={handleShareWhatsApp}
              title={t.send_whatsapp}
              sx={{
                color: isSendPhoneButtonDisabled ? (theme) => theme.palette.action.disabled : '#25D366',
              }}
            >
              <SendIcon className="-scale-x-100" />
            </IconButton>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)} disabled={isLoading}>
          {t.cancel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
