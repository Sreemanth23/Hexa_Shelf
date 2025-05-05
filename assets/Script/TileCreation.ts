import { _decorator, Component, instantiate, Material, MeshRenderer, Node, ParticleSystem, Prefab, setDisplayStats, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TileCreation')
export class TileCreation extends Component {
  setIndexData(HexArray: number[][], setIndexData: any, arg2: number, fixedArrayAngle: number) {
    throw new Error('Method not implemented.');
  }
  objects: number[] = [];
  originalobjects: number[] = [0, 1, 2, 3, 4, 5];
  @property(Prefab)
  HexaPrefab: Prefab = null;
  @property(Prefab)
  shelfContainer: Prefab = null;
  @property(Material)
  colorMaterial: Material[] = [];
  numberOfSets: number = 5;
  HexArray: Array<Array<number>> = [];
  setIdexArray: Array<Array<number>> = [];
  animNodes = [];
  count = 0; 

  @property(Node)
  BgNode: Node = null;
  @property(Node)
  particle:Node = null;
  start() {
    this.placingShelf();
    setDisplayStats(false);
  }

  placingShelf() {
    for (let i = 0; i < this.numberOfSets; i++) {
      const shelfContainer = instantiate(this.shelfContainer);
      shelfContainer.parent = this.node.children[2];
      shelfContainer.setPosition(0, -0.45 + i * 0.3, 0);
    }
    this.tileCreation();
  }

  tileCreation() {
    for (let k = 0; k < this.numberOfSets; k++) {
      let setdata = [];
      let objNames = [];
      let setIndexData = [];
      for (let j = 0; j < 18; j++) {
        const selectColor = Math.floor(Math.random() * 5);
        const parentNode = this.node.children[2].children[k].children[j];
        setIndexData.push(j);
        objNames.push(this.colorMaterial[selectColor].name);
        setdata.push(k >= 1 && j == 0 ? -1 : selectColor);
        for (let i = 0; i < 5; i++) {
          if (!(k >= 1 && j == 0)) {
            const tile = instantiate(this.HexaPrefab);
            tile.getComponent(MeshRenderer).materials[0] = this.colorMaterial[selectColor];
            tile.parent = parentNode;
            tile.setPosition(0, i * 0.05, 0);
          }
        }
      }
      if (setdata.length >= 18) {
        this.HexArray.push(setdata);
        this.setIdexArray.push(setIndexData);
    
      }
    }
  }

  changeinArray(Index, angle) {
   
    const rotatedArray1 = this.rotateArray(this.HexArray[Index], angle);
    this.HexArray[Index] = rotatedArray1;
    const rotatedArray2 = this.rotateArray(this.setIdexArray[Index], angle);
    this.setIdexArray[Index] = rotatedArray2;
    this.count++;
    if (this.checkFirstElements(this.HexArray)) {
      for (let i = 0; i < 5; i++) {
        this.animNodes.push(this.node.children[2].children[i].children[this.setIdexArray[i][0]]);
      }
      this.particle.active = true
      this.particle.getComponent(ParticleSystem).play();
      
      this.scheduleOnce(() => {
        this.tweenFunc();
        for (let i = 0; i < 5; i++) {
          this.HexArray[i][0] = -1;
   
        }
      }, 0.2);
    }
    if(this.count >= 15){
        this.BgNode.active = true;
    }
  }

  rotateArray(arr, degrees: number) {
    if (!Number.isFinite(degrees)) throw new Error("Degrees must be a finite number");
    const k = Math.floor(degrees / 20);
    const len = arr.length;
    const effectiveRotation = ((k % len) + len) % len;
    if (effectiveRotation === 0) return [...arr];
    const rotateIndex = len - effectiveRotation;
    return [...arr.slice(rotateIndex), ...arr.slice(0, rotateIndex)];
  }

  findSameElementIndices(nestedArray) {
    for (let pos = 0; pos < 19; pos++) {
      const firstElement = nestedArray[0][pos];
      if (nestedArray.every(subArray => subArray[pos] === firstElement)) return pos;
    }
    return -1;
  }

  checkFirstElements(arrays) {
    if (arrays.length !== 5 || arrays.some(arr => arr.length !== 18)) {
        throw new Error("Expected 5 arrays with 18 elements each");
    }
    const first = arrays[0][0];
    if (first === -1) {
        return false;
    }
    return arrays.every(arr => arr[0] === first);
}

  tweenFunc() {
    const allChildren = this.animNodes.flatMap(item => item.children);
    const animateChild = (index, childDelay = 0) => {
      if (index < 0) return;
      const child = allChildren[index];
      tween(child)
        .delay(childDelay)
        .to(0.1, { eulerAngles: new Vec3(0, -5 * (25 - index), 0) })
        .to(0.3, { scale: new Vec3(2, 5, 2) })
        .call(() => child.destroy())
        .start();
      animateChild(index - 1, childDelay + 0.1);
    };
    animateChild(allChildren.length - 1);
  }

}


