import { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import { SceneManager } from '../../lib/three/SceneManager';
import { MCStructure } from '../../lib/nbt/types';
import { importStructure } from '../../lib/nbt/fileHandler';

interface ViewportProps {
  onSelect: (type: 'block' | 'entity' | null, id: string | null) => void;
  structure: MCStructure | null;
  onStructureLoad: (structure: MCStructure) => void;
  onError: (message: string) => void;
  sceneManagerRef: React.RefObject<SceneManager>;
}

export default function Viewport({ 
  onSelect, 
  structure, 
  onStructureLoad, 
  onError,
  sceneManagerRef
}: ViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const resizeHandlerRef = useRef<() => void>();

  // ファイルドロップハンドラーをuseCallbackで定義
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.mcstructure')) return;

    try {
      const importedStructure = await importStructure(file);
      onStructureLoad(importedStructure);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to import file');
    }
  }, [onStructureLoad, onError]);

  // SceneManagerの初期化を一度だけ行う
  useEffect(() => {
    if (!canvasRef.current || sceneManagerRef.current) return;

    try {
      const sceneManager = new SceneManager(canvasRef.current, onSelect);
      sceneManagerRef.current = sceneManager;

      // リサイズハンドラを保持
      resizeHandlerRef.current = () => sceneManager.onWindowResize();
      window.addEventListener('resize', resizeHandlerRef.current);

      // レンダリングループ
      const renderLoop = () => {
        if (sceneManagerRef.current) {
          sceneManagerRef.current.controls.update();
          sceneManagerRef.current.renderer.render(
            sceneManagerRef.current.scene,
            sceneManagerRef.current.camera
          );
        }
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      };
      renderLoop();

      return () => {
        // クリーンアップ
        if (resizeHandlerRef.current) {
          window.removeEventListener('resize', resizeHandlerRef.current);
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (sceneManagerRef.current) {
          sceneManagerRef.current.dispose();
          sceneManagerRef.current = null;
        }
      };
    } catch (error) {
      console.error('Failed to initialize WebGL:', error);
      onError('Failed to initialize 3D viewer. Please check if your browser supports WebGL.');
    }
  }, []); // 依存配列を空にして初期化を1回だけに

  // 構造体データの更新時の処理
  useEffect(() => {
    if (structure && sceneManagerRef.current) {
      sceneManagerRef.current.loadStructure(structure);
    }
  }, [structure]);

  // onSelectの更新時にSceneManagerのコールバックを更新
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateSelectCallback(onSelect);
    }
  }, [onSelect]);

  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </Box>
  );
}
