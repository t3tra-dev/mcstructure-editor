import { Menu, MenuItem, Button, Input } from '@mui/material';
import { useState, useRef } from 'react';
import { Save, FileUpload, FileDownload } from '@mui/icons-material';
import { MCStructure } from '../../lib/nbt/types';
import { importStructure, exportStructure } from '../../lib/nbt/fileHandler';

interface FileMenuProps {
  structure: MCStructure | null;
  onStructureLoad: (structure: MCStructure) => void;
  onError: (message: string) => void;
}

export default function FileMenu({ structure, onStructureLoad, onError }: FileMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const structure = await importStructure(file);
      onStructureLoad(structure);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to import file');
    }
    handleClose();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = () => {
    if (!structure) {
      onError('No structure to export');
      return;
    }

    try {
      exportStructure(structure, 'structure.mcstructure');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to export file');
    }
    handleClose();
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<Save />}
      >
        File
      </Button>
      <Input
        type="file"
        inputRef={fileInputRef}
        sx={{ display: 'none' }}
        onChange={handleFileSelect}
        accept=".mcstructure"
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => fileInputRef.current?.click()}>
          <FileUpload sx={{ mr: 1 }} />
          Import
        </MenuItem>
        <MenuItem onClick={handleExport} disabled={!structure}>
          <FileDownload sx={{ mr: 1 }} />
          Export
        </MenuItem>
      </Menu>
    </>
  );
}
