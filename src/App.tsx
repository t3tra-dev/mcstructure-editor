import { useRef, useState } from "react";
import { Box, CssBaseline, Snackbar, Alert } from "@mui/material";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Viewport from "./components/Editor/Viewport";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
import { MCStructure } from "./lib/nbt/types";
import { SceneManager } from "./lib/three/SceneManager";

export default function App() {
  const [selectedElement, setSelectedElement] = useState<{
    type: "block" | "entity" | null;
    id: string | null;
  }>({ type: null, id: null });

  const [structure, setStructure] = useState<MCStructure | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [visibilitySettings, setVisibilitySettings] = useState<{
    blocks: { [key: string]: boolean },
    entities: { [key: string]: boolean }
  }>(() => ({
    blocks: {},
    entities: {}
  }));

  const sceneManagerRef = useRef<SceneManager | null>(null);

  const handleVisibilityChange = (
    type: "blocks" | "entities",
    id: string,
    visible: boolean
  ) => {
    setVisibilitySettings(prev => {
      const newSettings = {
        ...prev,
        [type]: {
          ...prev[type],
          [id]: visible
        }
      };
      
      // SceneManagerの更新を即時実行
      if (sceneManagerRef.current) {
        sceneManagerRef.current.updateVisibility(newSettings);
      }
      
      return newSettings;
    });
  };

  // 構造体のロード処理
  const handleStructureLoad = (newStructure: MCStructure) => {
    // 既存のブロックとエンティティを収集
    const blocks = new Set<string>();
    const entities = new Set<string>();
  
    // ブロックの収集
    const blockPalette = newStructure.structure.value.palette.value.default.value.block_palette.value.value;
    blockPalette.forEach(block => {
      if (block.name?.value) {
        blocks.add(block.name.value);
      }
    });
  
    // エンティティの収集
    if (newStructure.structure.value.entities?.value?.value) {
      newStructure.structure.value.entities.value.value.forEach(entity => {
        if (entity.identifier?.value) {
          entities.add(entity.identifier.value);
        }
      });
    }
  
    // 初期表示設定を設定（全て表示）
    setVisibilitySettings({
      blocks: Array.from(blocks).reduce((acc, name) => ({ ...acc, [name]: true }), {}),
      entities: Array.from(entities).reduce((acc, name) => ({ ...acc, [name]: true }), {})
    });
  
    setStructure(newStructure);
  };

  // 構造体の更新処理
  const handleStructureChange = (updatedStructure: MCStructure) => {
    setStructure(updatedStructure);
  };

  // エラー処理
  const handleError = (message: string) => {
    setNotification({
      open: true,
      message,
      severity: "error",
    });
  };

  // 選択ハンドラー
  const handleElementSelect = (type: "block" | "entity", id: string) => {
    console.log("Selected:", type, id); // デバッグ用
    setSelectedElement({ type, id });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Header
          structure={structure}
          onStructureLoad={handleStructureLoad}
          onError={handleError}
          sceneManagerRef={sceneManagerRef}
          visibilitySettings={visibilitySettings}
          onVisibilityChange={handleVisibilityChange}
        />
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Viewport
            onSelect={handleElementSelect}
            structure={structure}
            onStructureLoad={handleStructureLoad}
            onError={handleError}
            sceneManagerRef={sceneManagerRef}
          />
          <Sidebar
            selectedElement={selectedElement}
            structure={structure}
            onStructureChange={handleStructureChange}
          />
        </Box>
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            severity={notification.severity}
            onClose={() =>
              setNotification((prev) => ({ ...prev, open: false }))
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
