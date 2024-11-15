import { AppBar, Toolbar, Typography } from "@mui/material";
import FileMenu from "./FileMenu";
import EditMenu from "./EditMenu";
import ViewMenu from "./ViewMenu";
import { headerStyles } from "./styles";
import { MCStructure } from "../../lib/nbt/types";
import { SceneManager } from "../../lib/three/SceneManager";

interface HeaderProps {
  structure: MCStructure | null;
  onStructureLoad: (structure: MCStructure) => void;
  onError: (message: string) => void;
  visibilitySettings: {
    blocks: { [key: string]: boolean };
    entities: { [key: string]: boolean };
  };
  onVisibilityChange: (type: 'blocks' | 'entities', id: string, visible: boolean) => void;
  sceneManagerRef: React.RefObject<SceneManager>;
}

export default function Header({
  structure,
  onStructureLoad,
  onError,
  visibilitySettings,
  onVisibilityChange,
  sceneManagerRef
}: HeaderProps) {
  return (
    <AppBar position="static" sx={headerStyles.appBar}>
      <Toolbar variant="dense">
        <Typography variant="h6" sx={headerStyles.title}>
          MCStructure Editor
        </Typography>
        <FileMenu
          structure={structure}
          onStructureLoad={onStructureLoad}
          onError={onError}
        />
        <EditMenu />
        <ViewMenu
          structure={structure}
          visibilitySettings={visibilitySettings}
          onVisibilityChange={onVisibilityChange}
          sceneManagerRef={sceneManagerRef}
        />
      </Toolbar>
    </AppBar>
  );
}
