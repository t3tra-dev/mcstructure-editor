import { Box, TextField, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface BlockEditorProps {
  id: string;
  blockData: unknown;
  onChange?: (updates: unknown) => void;
}

function renderValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

export default function BlockEditor({ id, blockData, onChange }: BlockEditorProps) {
  if (!blockData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Invalid block data
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Block Properties
      </Typography>
      
      <TextField
        label="Block ID"
        value={blockData.name.value}
        fullWidth
        margin="normal"
        disabled
      />

      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Position
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        {id.split('_').slice(1).map((coord, index) => (
          <TextField
            key={index}
            label={['X', 'Y', 'Z'][index]}
            value={coord}
            disabled
            size="small"
          />
        ))}
      </Box>

      {/* Block States */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Block States</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(blockData.states.value || {}).map(([key, data]: [string, unknown]) => (
              <TextField
                key={key}
                label={key}
                value={data.value}
                fullWidth
                size="small"
                disabled
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Block Entity Data */}
      {blockData.block_entity_data && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Block Entity Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(blockData.block_entity_data).map(([key, data]: [string, any]) => {
                if (key === 'id') return null; // idは上部で表示済みのため除外

                const value = data.value;
                return (
                  <TextField
                    key={key}
                    label={key}
                    value={renderValue(value)}
                    fullWidth
                    size="small"
                    disabled
                    multiline={typeof value === 'string' && value.length > 30}
                  />
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Version Info */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Version Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="Version"
            value={blockData.version.value}
            fullWidth
            size="small"
            disabled
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
