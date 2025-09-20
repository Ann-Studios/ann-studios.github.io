import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Lightbulb } from 'lucide-react';

export const ChessGame = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const boardRef = useRef<THREE.Group>();
  const piecesRef = useRef<THREE.Group>();
  const [selectedPiece, setSelectedPiece] = useState<THREE.Object3D | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create chess board
    const boardGroup = new THREE.Group();
    boardRef.current = boardGroup;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const geometry = new THREE.BoxGeometry(1, 0.1, 1);
        const isLight = (row + col) % 2 === 0;
        const material = new THREE.MeshLambertMaterial({
          color: isLight ? 0xf0d9b5 : 0xb58863
        });
        
        const square = new THREE.Mesh(geometry, material);
        square.position.set(col - 3.5, 0, row - 3.5);
        square.receiveShadow = true;
        square.userData = { type: 'board', row, col };
        boardGroup.add(square);
      }
    }
    scene.add(boardGroup);

    // Create chess pieces
    const piecesGroup = new THREE.Group();
    piecesRef.current = piecesGroup;

    const createPiece = (type: string, color: string, x: number, z: number) => {
      const geometry = type === 'pawn' ? 
        new THREE.CylinderGeometry(0.2, 0.3, 0.6, 8) :
        type === 'rook' ? 
        new THREE.BoxGeometry(0.4, 0.8, 0.4) :
        type === 'knight' ? 
        new THREE.ConeGeometry(0.3, 0.8, 6) :
        type === 'bishop' ? 
        new THREE.ConeGeometry(0.2, 0.9, 8) :
        type === 'queen' ? 
        new THREE.CylinderGeometry(0.15, 0.4, 1, 8) :
        new THREE.SphereGeometry(0.4, 16, 12); // king

      const material = new THREE.MeshLambertMaterial({
        color: color === 'white' ? 0xffffff : 0x333333
      });

      const piece = new THREE.Mesh(geometry, material);
      piece.position.set(x - 3.5, 0.5, z - 3.5);
      piece.castShadow = true;
      piece.userData = { type: 'piece', pieceType: type, color, originalPos: { x, z } };
      piecesGroup.add(piece);
    };

    // Setup initial piece positions
    const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    // Black pieces
    for (let i = 0; i < 8; i++) {
      createPiece('pawn', 'black', i, 1);
      createPiece(backRow[i], 'black', i, 0);
    }
    
    // White pieces
    for (let i = 0; i < 8; i++) {
      createPiece('pawn', 'white', i, 6);
      createPiece(backRow[i], 'white', i, 7);
    }

    scene.add(piecesGroup);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([...boardGroup.children, ...piecesGroup.children]);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        if (clickedObject.userData.type === 'piece') {
          if (clickedObject.userData.color === currentPlayer) {
            setSelectedPiece(clickedObject);
            // Highlight selected piece
            if (clickedObject instanceof THREE.Mesh) {
              (clickedObject.material as THREE.MeshLambertMaterial).emissive.setHex(0x444444);
            }
          }
        } else if (clickedObject.userData.type === 'board' && selectedPiece) {
          // Move piece
          const { row, col } = clickedObject.userData;
          selectedPiece.position.set(col - 3.5, 0.5, row - 3.5);
          
          // Remove highlight
          if (selectedPiece instanceof THREE.Mesh) {
            (selectedPiece.material as THREE.MeshLambertMaterial).emissive.setHex(0x000000);
          }
          setSelectedPiece(null);
          setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedPiece, currentPlayer]);

  const resetGame = () => {
    setSelectedPiece(null);
    setCurrentPlayer('white');
    // Reload the component to reset positions
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">3D Chess</h1>
            <Badge variant="secondary" className="bg-ann-red/20 text-ann-red border-ann-red/30">
              Strategy
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={currentPlayer === 'white' ? 'default' : 'secondary'}
              className={currentPlayer === 'white' ? 'bg-ann-red text-white' : ''}
            >
              Current: {currentPlayer === 'white' ? 'White' : 'Black'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg">
          <div 
            ref={mountRef} 
            className="w-full aspect-square max-h-[80vh] cursor-pointer"
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-ann-red mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">How to Play:</h3>
              <p className="text-sm text-muted-foreground">
                Click on a piece to select it, then click on a square to move. 
                This is a simplified chess game - pieces can move to any square for demonstration purposes.
                Click and drag to rotate the camera view.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};