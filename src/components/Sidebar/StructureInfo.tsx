import { Box, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { MCStructure } from '../../lib/nbt/types';

interface StructureInfoProps {
  structure: MCStructure | null;
  onChange?: (structure: MCStructure) => void;
}

export default function StructureInfo({ structure }: StructureInfoProps) {
  // 構造体データから初期値を設定
  const [info, setInfo] = useState({
    name: '',
    sizeX: structure?.size.value.value[0] ?? 0,
    sizeY: structure?.size.value.value[1] ?? 0,
    sizeZ: structure?.size.value.value[2] ?? 0,
    originX: structure?.structure_world_origin.value.value[0] ?? 0,
    originY: structure?.structure_world_origin.value.value[1] ?? 0,
    originZ: structure?.structure_world_origin.value.value[2] ?? 0
  });

  // 構造体データが変更されたら情報を更新
  useEffect(() => {
    if (structure) {
      setInfo({
        name: '',  // 構造体に名前のフィールドがない場合
        sizeX: structure.size.value.value[0],
        sizeY: structure.size.value.value[1],
        sizeZ: structure.size.value.value[2],
        originX: structure.structure_world_origin.value.value[0],
        originY: structure.structure_world_origin.value.value[1],
        originZ: structure.structure_world_origin.value.value[2]
      });
    }
  }, [structure]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Structure Information</Typography>
      <TextField 
        label="Name"
        value={info.name}
        onChange={(e) => setInfo({ ...info, name: e.target.value })}
        fullWidth
        margin="normal"
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        <TextField
          label="Size X"
          type="number"
          value={info.sizeX}
          onChange={(e) => setInfo({ ...info, sizeX: Number(e.target.value) })}
        />
        <TextField
          label="Size Y"
          type="number"
          value={info.sizeY}
          onChange={(e) => setInfo({ ...info, sizeY: Number(e.target.value) })}
        />
        <TextField
          label="Size Z"
          type="number"
          value={info.sizeZ}
          onChange={(e) => setInfo({ ...info, sizeZ: Number(e.target.value) })}
        />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 2 }}>
        <TextField
          label="Origin X"
          type="number"
          value={info.originX}
          onChange={(e) => setInfo({ ...info, originX: Number(e.target.value) })}
        />
        <TextField
          label="Origin Y"
          type="number"
          value={info.originY}
          onChange={(e) => setInfo({ ...info, originY: Number(e.target.value) })}
        />
        <TextField
          label="Origin Z"
          type="number"
          value={info.originZ}
          onChange={(e) => setInfo({ ...info, originZ: Number(e.target.value) })}
        />
      </Box>
    </Box>
  );
}
