import {
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  Checkbox,
  Typography,
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

  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateVisibility(visibilitySettings);
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

  const { blocks, entities } = getObjectsList();

  return (
    <>
      <Button color="inherit" onClick={handleClick} startIcon={<Visibility />}>
        View
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: "70vh",
            width: "300px",
            padding: "8px",
          },
        }}
      >
        {!structure ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
            No structure loaded
          </Typography>
        ) : (
          <SimpleTreeView
            aria-label="structure elements"
            expandIcon={<ChevronRightIcon />}
            collapseIcon={<ExpandMoreIcon />}
          >
            <TreeItem nodeId="blocks-root" label="Blocks">
              {blocks.size === 0 ? (
                <TreeItem
                  nodeId="blocks-empty"
                  itemId="blocks-empty"
                  label="No blocks found"
                />
              ) : (
                Array.from(blocks.entries()).map(([blockId, count]) => {
                  const itemId = `block-${blockId}`;
                  return (
                    <TreeItem
                      key={itemId}
                      nodeId={itemId}
                      itemId={itemId}
                      label={
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={
                                visibilitySettings.blocks[blockId] !== false
                              }
                              onChange={(e) => {
                                e.stopPropagation();
                                onVisibilityChange(
                                  "blocks",
                                  blockId,
                                  e.target.checked
                                );
                              }}
                            />
                          </ListItemIcon>
                          <Typography variant="body2">
                            {blockId} ({count})
                          </Typography>
                        </MenuItem>
                      }
                    />
                  );
                })
              )}
            </TreeItem>
            <TreeItem nodeId="entities-root" label="Entities">
              {entities.size === 0 ? (
                <TreeItem
                  nodeId="entities-empty"
                  itemId="entities-empty"
                  label="No entities found"
                />
              ) : (
                Array.from(entities.entries()).map(([entityId, count]) => {
                  const itemId = `entity-${entityId}`;
                  return (
                    <TreeItem
                      key={itemId}
                      nodeId={itemId}
                      itemId={itemId}
                      label={
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={
                                visibilitySettings.entities[entityId] !== false
                              }
                              onChange={(e) => {
                                e.stopPropagation();
                                onVisibilityChange(
                                  "entities",
                                  entityId,
                                  e.target.checked
                                );
                              }}
                            />
                          </ListItemIcon>
                          <Typography variant="body2">
                            {entityId} ({count})
                          </Typography>
                        </MenuItem>
                      }
                    />
                  );
                })
              )}
            </TreeItem>
          </SimpleTreeView>
        )}
      </Menu>
    </>
  );
}
