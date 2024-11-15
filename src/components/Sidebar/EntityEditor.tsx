import { Box, TextField, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface EntityEditorProps {
  id: string;
  entityData: unknown;
  onChange?: (updates: unknown) => void;
}

function renderValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

function renderCompoundList(data: unknown[], title: string) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.map((item, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{`Item ${index + 1}`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(item).map(([key, data]: [string, unknown]) => (
                    <TextField
                      key={key}
                      label={key}
                      value={data.value !== undefined ? renderValue(data.value) : renderValue(data)}
                      fullWidth
                      size="small"
                      disabled
                      multiline={typeof data.value === 'string' && data.value.length > 30}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default function EntityEditor({ id, entityData }: EntityEditorProps) {
  if (!entityData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Invalid entity data
        </Typography>
      </Box>
    );
  }

  // 基本情報のセクション
  const basicInfo = {
    identifier: entityData.identifier,
    definitions: entityData.definitions,
    UniqueID: entityData.UniqueID,
    Pos: entityData.Pos,
    Rotation: entityData.Rotation,
  };

  // 配列データを含むセクション
  const arrayData = {
    Armor: entityData.Armor?.value?.value,
    Attributes: entityData.Attributes?.value?.value,
    Mainhand: entityData.Mainhand?.value?.value,
    Offhand: entityData.Offhand?.value?.value,
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Entity Properties
      </Typography>

      {/* 基本情報 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Basic Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(basicInfo).map(([key, data]: [string, unknown]) => (
              <TextField
                key={key}
                label={key}
                value={data?.value ? renderValue(data.value) : renderValue(data)}
                fullWidth
                size="small"
                disabled
                multiline={typeof data === 'string' && data.length > 30}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 配列データ */}
      {Object.entries(arrayData).map(([key, value]) => {
        if (value) {
          return renderCompoundList(value, key);
        }
        return null;
      })}

      {/* その他のプロパティ */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Other Properties</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(entityData).map(([key, data]: [string, unknown]) => {
              if (key in basicInfo || key in arrayData) return null;
              return (
                <TextField
                  key={key}
                  label={key}
                  value={data.value !== undefined ? renderValue(data.value) : renderValue(data)}
                  fullWidth
                  size="small"
                  disabled
                  multiline={typeof data === 'string' && data.length > 30}
                />
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
