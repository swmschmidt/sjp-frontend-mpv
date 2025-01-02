import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tooltip } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import axios from 'axios';

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [tooltipOpen, setTooltipOpen] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
    setTooltipOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSend = async () => {
    let pageOfOrigin = window.location.pathname.replace(/\//g, '');
    if (pageOfOrigin === '') {
      pageOfOrigin = 'homepage';
    }
    try {
      const response = await axios.post('https://flask-app-rough-glitter-6700.fly.dev/add_message', {
        message,
        page_of_origin: pageOfOrigin,
      });
      if (response.status === 200) {
        alert('Mensagem enviada com sucesso!');
      } else {
        alert('Erro ao enviar mensagem.');
      }
    } catch (error) {
      alert('Erro ao enviar mensagem.');
    }
    setOpen(false);
  };

  return (
    <>
      <Tooltip
        title="Clique aqui para enviar seu feedback"
        open={tooltipOpen}
        onClose={() => setTooltipOpen(false)}
        disableHoverListener
        disableFocusListener
        disableTouchListener
        placement="top"
      >
        <Fab color="secondary" aria-label="feedback" onClick={handleClickOpen} style={{ position: 'fixed', bottom: 120, right: 16 }}>
          <FeedbackIcon />
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enviar Feedback</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Mensagem"
            type="text"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSend} color="primary">
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackButton;
