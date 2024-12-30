import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

type FloatingHelpButtonProps = {
  description: string;
};

const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({ description }) => {
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
    setTooltipOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip
        title="Clique aqui para saber mais sobre essa página"
        open={tooltipOpen}
        onClose={() => setTooltipOpen(false)}
        disableHoverListener
        disableFocusListener
        disableTouchListener
      >
        <Fab color="primary" aria-label="help" onClick={handleClickOpen} style={{ position: 'fixed', bottom: 16, right: 16 }}>
          <HelpOutlineIcon />
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Informações sobre a página</DialogTitle>
        <DialogContent>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FloatingHelpButton;
