import { Menu, MenuItem, Button } from '@mui/material';
import { useState } from 'react';
import { 
  Edit, 
  Delete, 
  ContentCopy, 
  ContentPaste,
  Undo,
  Redo 
} from '@mui/icons-material';

export default function EditMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 編集履歴の状態（実際の実装では状態管理が必要）
  const canUndo = false;
  const canRedo = false;

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<Edit />}
      >
        Edit
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem 
          onClick={handleClose}
          disabled={!canUndo}
        >
          <Undo sx={{ mr: 1 }} />
          Undo
        </MenuItem>
        <MenuItem 
          onClick={handleClose}
          disabled={!canRedo}
        >
          <Redo sx={{ mr: 1 }} />
          Redo
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ContentCopy sx={{ mr: 1 }} />
          Copy
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ContentPaste sx={{ mr: 1 }} />
          Paste
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
