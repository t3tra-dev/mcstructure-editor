import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MCStructure } from '../nbt/types';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private blocks: Map<string, THREE.Mesh>;
  private entities: Map<string, THREE.Mesh>;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private onSelect: (type: 'block' | 'entity', id: string) => void;
  private initialCameraSetup: boolean = false;
  private boundHandleClick = (event: MouseEvent) => this.handleClick(event);
  private boundHandleMouseMove = (event: MouseEvent) => this.handleMouseMove(event);
  private boundOnWindowResize = () => this.onWindowResize();

  constructor(canvas: HTMLCanvasElement, onSelect: (type: 'block' | 'entity', id: string) => void) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // WebGLRendererの設定を修正
    this.renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      powerPreference: "default", // "high-performance"から変更
      alpha: true,
      preserveDrawingBuffer: true,
      failIfMajorPerformanceCaveat: true
    });

    // レンダラーの初期設定
    const pixelRatio = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.blocks = new Map();
    this.entities = new Map();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onSelect = onSelect;

    this.init();
  }

  private init() {
    this.scene.background = new THREE.Color(0xf0f0f0);
    this.camera.position.set(5, 5, 5);
    this.setupLights();
    this.setupBaseGrid(); // 基本グリッドを設定
    this.setupEventListeners();
  }

  public updateSelectCallback(callback: (type: 'block' | 'entity', id: string) => void) {
    this.onSelect = callback;
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    
    // シャドウの設定
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    this.scene.add(ambientLight, directionalLight);
  }

  private setupBaseGrid() {
    const baseGrid = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    this.scene.add(baseGrid);
  }

  // 構造体のグリッドの設定
  private setupStructureGrid(size: number[]) {
    const [sizeX, sizeY, sizeZ] = size;

    // 垂直グリッドの生成
    const verticalGridGeometry = new THREE.BufferGeometry();
    const verticalGridMaterial = new THREE.LineBasicMaterial({ 
      color: 0xcccccc, 
      opacity: 0.3, 
      transparent: true 
    });
    const verticalLines = [];

    // X方向のグリッド線
    for (let y = 0; y <= sizeY; y++) {
      for (let x = 0; x <= sizeX; x++) {
        verticalLines.push(
          x, y, 0,
          x, y, sizeZ
        );
      }
    }

    // Z方向のグリッド線
    for (let y = 0; y <= sizeY; y++) {
      for (let z = 0; z <= sizeZ; z++) {
        verticalLines.push(
          0, y, z,
          sizeX, y, z
        );
      }
    }

    const vertices = new Float32Array(verticalLines);
    verticalGridGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const verticalGridLines = new THREE.LineSegments(verticalGridGeometry, verticalGridMaterial);
    verticalGridLines.name = 'structureGrid'; // 後で識別できるように名前を設定
    this.scene.add(verticalGridLines);
  }

  private setupEventListeners() {
    const canvas = this.renderer.domElement;
    
    // バインドされたメソッドを保持
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundOnWindowResize = this.onWindowResize.bind(this);

    canvas.addEventListener('click', this.boundHandleClick);
    canvas.addEventListener('mousemove', this.boundHandleMouseMove);
  }

  private handleMouseMove(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handleClick(event: MouseEvent) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // ブロックとの交差判定
    const blockIntersects = this.raycaster.intersectObjects([...this.blocks.values()]);
    if (blockIntersects.length > 0) {
      const selectedBlock = blockIntersects[0].object;
      this.highlightSelected(selectedBlock);
      this.onSelect('block', selectedBlock.userData.id);
      return;
    }

    // エンティティとの交差判定
    const entityIntersects = this.raycaster.intersectObjects([...this.entities.values()]);
    if (entityIntersects.length > 0) {
      const selectedEntity = entityIntersects[0].object;
      this.highlightSelected(selectedEntity);
      this.onSelect('entity', selectedEntity.userData.id);
    }
  }

  private highlightSelected(object: THREE.Mesh) {
    // 全てのオブジェクトの色を元に戻す
    this.blocks.forEach(block => {
      (block.material as THREE.MeshPhongMaterial).color.setHex(0x00ff00);
      (block.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
    });
    this.entities.forEach(entity => {
      (entity.material as THREE.MeshPhongMaterial).color.setHex(0x0000ff);
      (entity.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
    });

    // 選択されたオブジェクトをハイライト
    const material = object.material as THREE.MeshPhongMaterial;
    material.emissive.setHex(0x444444);
  }

  public onWindowResize() {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public loadStructure(structure: MCStructure) {
    // 既存のオブジェクトをクリア
    this.clearObjects();
  
    const size = structure.size.value.value;
    this.setupStructureGrid(size);

    // ブロックの生成
    const blockMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

    const blockIndices = structure.structure.value.block_indices.value.value[0].value;
    const blockPalette = structure.structure.value.palette.value.default.value.block_palette.value;

    blockIndices.forEach((paletteIndex, index) => {
      if (paletteIndex === -1) return;

      const blockDef = blockPalette[paletteIndex];
      const x = index % size[0];
      const y = Math.floor(index / (size[0] * size[2]));
      const z = Math.floor((index % (size[0] * size[2])) / size[0]);

      const mesh = new THREE.Mesh(blockGeometry, blockMaterial.clone());
      mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
      mesh.userData.id = `block_${x}_${y}_${z}`;
      mesh.userData.definition = blockDef;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      this.blocks.set(mesh.userData.id, mesh);
      this.scene.add(mesh);
    });

    // エンティティの生成
    const entityMaterial = new THREE.MeshPhongMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5
    });
    const entityGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    
    if (structure.structure.value.entities?.value?.value) {
      const entities = structure.structure.value.entities.value.value;
      entities.forEach((entity, index) => {
        try {
          // Pos プロパティから位置データを取得
          const position = entity.Pos?.value?.value;
          if (!position) {
            console.warn(`No position data for entity ${index}`);
            return;
          }
    
          const mesh = new THREE.Mesh(entityGeometry, entityMaterial.clone());
          mesh.position.set(
            position[0] - structure.structure_world_origin.value.value[0],
            position[1] - structure.structure_world_origin.value.value[1],
            position[2] - structure.structure_world_origin.value.value[2]
          );
          mesh.userData.id = `entity_${index}`;
          mesh.userData.definition = entity;
    
          this.entities.set(mesh.userData.id, mesh);
          this.scene.add(mesh);
          console.log(`Added entity at position:`, position);
        } catch (error) {
          console.error('Error creating entity mesh:', error);
          console.log('Entity data:', entity);
        }
      });
    }

    // カメラの初期設定は最初の読み込み時のみ行う
    if (!this.initialCameraSetup) {
      this.adjustCameraToStructure(size);
      this.initialCameraSetup = true;
    }
  }

  private clearObjects() {
    // 既存のオブジェクトをクリア
    this.blocks.forEach(block => {
      if (block.geometry) block.geometry.dispose();
      if (block.material instanceof THREE.Material) block.material.dispose();
      this.scene.remove(block);
    });
    this.blocks.clear();

    this.entities.forEach(entity => {
      if (entity.geometry) entity.geometry.dispose();
      if (entity.material instanceof THREE.Material) entity.material.dispose();
      this.scene.remove(entity);
    });
    this.entities.clear();

    // 構造体グリッドの削除
    const existingGrid = this.scene.getObjectByName('structureGrid');
    if (existingGrid) {
      this.scene.remove(existingGrid);
    }
  }

  private adjustCameraToStructure(size: number[]) {
    const [sizeX, sizeY, sizeZ] = size;
    const maxDimension = Math.max(sizeX, sizeY, sizeZ);
    const distance = maxDimension * 2;
    
    // カメラの位置を設定
    this.camera.position.set(distance, distance, distance);
    
    // 構造体の中心を注視点に設定
    const center = new THREE.Vector3(sizeX / 2, sizeY / 2, sizeZ / 2);
    this.camera.lookAt(center);
    this.controls.target.copy(center);
    
    // コントロールを更新
    this.controls.update();
  }

  public dispose() {
    // イベントリスナーの削除
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('click', this.boundHandleClick);
    canvas.removeEventListener('mousemove', this.boundHandleMouseMove);

    // オブジェクトのクリア
    this.clearObjects();

    // コントロールの破棄
    this.controls.dispose();

    // レンダラーの破棄
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    
    // シーンのクリア
    this.scene.clear();
  }

  public updateVisibility(settings: {
    blocks: { [key: string]: boolean },
    entities: { [key: string]: boolean }
  }) {
    // ブロックの可視性を更新
    this.blocks.forEach((mesh, id) => {
      const blockName = mesh.userData.definition.name.value;
      mesh.visible = settings.blocks[blockName] !== false;
      // クリック判定の無効化
      mesh.layers.enable(settings.blocks[blockName] !== false ? 0 : 1);
    });
  
    // エンティティの可視性を更新
    this.entities.forEach((mesh, id) => {
      const entityName = mesh.userData.definition.identifier.value;
      mesh.visible = settings.entities[entityName] !== false;
      // クリック判定の無効化
      mesh.layers.enable(settings.entities[entityName] !== false ? 0 : 1);
    });
  }
}
