import { Paper, Box, Typography } from "@mui/material";
import StructureInfo from "./StructureInfo";
import BlockEditor from "./BlockEditor";
import EntityEditor from "./EntityEditor";
import { MCStructure } from "../../lib/nbt/types";
import { useEffect } from "react";

interface SidebarProps {
  selectedElement: {
    type: "block" | "entity" | null;
    id: string | null;
  };
  structure: MCStructure | null;
  onStructureChange?: (structure: MCStructure) => void;
}

export default function Sidebar({ selectedElement, structure, onStructureChange }: SidebarProps) {
  useEffect(() => {
    console.log('Current structure:', structure);
    console.log('Selected element:', selectedElement);
  }, [structure, selectedElement]);

  const getSelectedBlockData = () => {
    if (!structure || !selectedElement.id || selectedElement.type !== 'block') {
      return null;
    }
    
    try {
      const [x, y, z] = selectedElement.id.split('_').slice(1).map(Number);
      const sizeX = structure.size.value.value[0];
      const sizeZ = structure.size.value.value[2];
      const index = x + z * sizeX + y * sizeX * sizeZ;
      
      const blockIndices = structure.structure.value.block_indices.value.value[0].value;
      const blockIndex = blockIndices[index];
      
      if (blockIndex === -1 || blockIndex === undefined) {
        return null;
      }
      
      // ブロックパレットからブロックデータを取得
      const blockPalette = structure.structure.value.palette.value.default.value.block_palette.value.value;
      const blockData = blockPalette[blockIndex];
  
      // block_entity_dataを取得
      const blockEntityData = structure.structure.value.palette.value.default.value
        .block_position_data.value[blockIndex]?.value.block_entity_data?.value;
  
      // ブロックデータとエンティティデータを結合
      return {
        ...blockData,
        block_entity_data: blockEntityData
      };
    } catch (error) {
      console.error('Error getting block data:', error);
      return null;
    }
  };

  const getSelectedEntityData = () => {
    if (!structure || !selectedElement.id || selectedElement.type !== 'entity') return null;
    
    try {
      const entityIndex = parseInt(selectedElement.id.split('_')[1]);
      const entities = structure.structure.value.entities.value.value;
      
      if (entities && entities[entityIndex]) {
        console.log('Found entity data:', entities[entityIndex]);
        return entities[entityIndex];
      }
      
      console.log('Entity not found at index:', entityIndex);
      return null;
    } catch (error) {
      console.error('Error getting entity data:', error);
      return null;
    }
  };

  const renderContent = () => {
    if (!selectedElement.type) {
      return <StructureInfo structure={structure} onChange={onStructureChange} />;
    }

    if (selectedElement.type === 'block') {
      console.log('Rendering block editor...');
      const blockData = getSelectedBlockData();
      console.log('Block data for editor:', blockData);

      if (!blockData) {
        return (
          <Box sx={{ p: 2 }}>
            <Typography color="error">
              Failed to load block data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selected position: {selectedElement.id}
            </Typography>
          </Box>
        );
      }

      return (
        <BlockEditor 
          id={selectedElement.id!}
          blockData={blockData}
          onChange={(updates) => {
            if (onStructureChange && structure) {
              // 構造体の更新処理を実装
            }
          }}
        />
      );
    }

    if (selectedElement.type === 'entity') {
      const entityData = getSelectedEntityData();
      
      if (!entityData) {
        return (
          <Box sx={{ p: 2 }}>
            <Typography color="error">
              Failed to load entity data
            </Typography>
          </Box>
        );
      }

      return (
        <EntityEditor 
          id={selectedElement.id!}
          entityData={entityData}
          onChange={(updates) => {
            // エンティティの更新処理
          }}
        />
      );
    }

    return null;
  };

  return (
    <Paper sx={{ 
      width: 300, 
      height: '100%', 
      overflow: 'auto',
      borderLeft: '1px solid',
      borderColor: 'divider'
    }}>
      {renderContent()}
    </Paper>
  );
}
