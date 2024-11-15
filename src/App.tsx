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

  const [visibilitySettings, setVisibilitySettings] = useState({
    blocks: {} as { [key: string]: boolean },
    entities: {} as { [key: string]: boolean },
  });

  const sceneManagerRef = useRef<SceneManager | null>(null);

  const handleVisibilityChange = (
    type: "blocks" | "entities",
    id: string,
    visible: boolean
  ) => {
    setVisibilitySettings((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: visible,
      },
    }));
  };

  // 構造体のロード処理
  const handleStructureLoad = (newStructure: MCStructure) => {
    setStructure(newStructure);
    setNotification({
      open: true,
      message: "Structure loaded successfully",
      severity: "success",
    });
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
