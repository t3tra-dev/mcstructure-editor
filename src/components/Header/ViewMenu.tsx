import {
  Menu,
  Button,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useEffect, useState } from "react";
import { MCStructure } from "../../lib/nbt/types";
import { SceneManager } from "../../lib/three/SceneManager";

interface ViewMenuProps {
  structure: MCStructure | null;
  visibilitySettings: {
    blocks: { [key: string]: boolean };
    entities: { [key: string]: boolean };
  };
  onVisibilityChange: (
    type: "blocks" | "entities",
    id: string,
    visible: boolean
  ) => void;
  sceneManagerRef: React.RefObject<SceneManager>;
}

export default function ViewMenu({
  structure,
  visibilitySettings,
  onVisibilityChange,
  sceneManagerRef,
}: ViewMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // visibilitySettingsの変更を監視してSceneManagerを更新
  useEffect(() => {
    if (sceneManagerRef.current) {
      try {
        sceneManagerRef.current.updateVisibility(visibilitySettings);
      } catch (error) {
        console.error('Error updating visibility:', error);
      }
    }
  }, [visibilitySettings, sceneManagerRef]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getObjectsList = () => {
    const blocks = new Map<string, number>();
    const entities = new Map<string, number>();

    if (structure) {
      const blockPalette =
        structure.structure.value.palette.value.default.value.block_palette
          .value.value;
      structure.structure.value.block_indices.value.value[0].value.forEach(
        (index: number) => {
          if (index !== -1) {
            const blockName = blockPalette[index].name.value;
            blocks.set(blockName, (blocks.get(blockName) || 0) + 1);
          }
        }
      );

      if (structure.structure.value.entities?.value?.value) {
        structure.structure.value.entities.value.value.forEach(
          (entity: any) => {
            const entityName = entity.identifier.value;
            entities.set(entityName, (entities.get(entityName) || 0) + 1);
          }
        );
      }
    }

    return { blocks, entities };
  };

  // ツリーアイテムのレンダリング関数
  const renderTreeItem = (
    id: string, 
    label: string, 
    count: number, 
    type: 'blocks' | 'entities',
    settings: typeof visibilitySettings
  ) => {
    const sanitizedId = id.replace(/[^\w-]/g, '_');
    const uniqueId = `${type.slice(0, -1)}-${sanitizedId}`;

    return (
      <TreeItem
        key={uniqueId}
        nodeId={uniqueId}
        itemId={uniqueId}
        label={
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            <Checkbox
              checked={settings[type][id] !== false}
              onChange={(e) => {
                e.stopPropagation();
                onVisibilityChange(type, id, e.target.checked);
              }}
              onClick={e => e.stopPropagation()}
            />
            <Typography variant="body2">
              {id} ({count})
            </Typography>
          </Box>
        }
      />
    );
  };

  const { blocks, entities } = getObjectsList();

  return (
    <>
      <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} startIcon={<Visibility />}>
        View
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          style: {
            maxHeight: '70vh',
            width: '300px',
            padding: '8px',
          },
        }}
      >
        {!structure ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
            No structure loaded
          </Typography>
        ) : (
          <Box sx={{ maxWidth: '100%', maxHeight: '60vh', overflow: 'auto' }}>
            <SimpleTreeView
              aria-label="structure elements"
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              defaultExpanded={['blocks-root', 'entities-root']}
            >
              <TreeItem 
                nodeId="blocks-root"
                itemId="blocks-root"
                label={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Blocks
                  </Typography>
                }
              >
                {blocks.size === 0 ? (
                  <TreeItem
                    nodeId="blocks-empty"
                    itemId="blocks-empty"
                    label="No blocks found"
                  />
                ) : (
                  Array.from(blocks.entries()).map(([id, count]) =>
                    renderTreeItem(id, id, count, 'blocks', visibilitySettings)
                  )
                )}
              </TreeItem>

              <TreeItem
                nodeId="entities-root"
                itemId="entities-root"
                label={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Entities
                  </Typography>
                }
              >
                {entities.size === 0 ? (
                  <TreeItem
                    nodeId="entities-empty"
                    itemId="entities-empty"
                    label="No entities found"
                  />
                ) : (
                  Array.from(entities.entries()).map(([id, count]) =>
                    renderTreeItem(id, id, count, 'entities', visibilitySettings)
                  )
                )}
              </TreeItem>
            </SimpleTreeView>
          </Box>
        )}
      </Menu>
    </>
  );
}
