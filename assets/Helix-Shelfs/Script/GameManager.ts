import { _decorator, Camera, Component, EventTouch, geometry, input, Input, Node, PhysicsSystem } from 'cc';
import { TileCreation } from './TileCreation';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Camera) camera: Camera = null;
  @property(Node) HelixParentNode: Node = null;
  @property(TileCreation) tileCreation: TileCreation = null;

  StartingPoint;
  SelectedNode: Node = null;
  InitialAngle;
  previousAngle = 0;
  Touch = true;

  onEnable() {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onDisable() {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  onTouchStart(event) {
    const mousePos = event.getLocation();
    this.StartingPoint = mousePos.x;
    const ray = new geometry.Ray();
    this.camera.screenPointToRay(mousePos.x, mousePos.y, ray);
    const mask = 0xffffffff;
    const maxDistance = 1000;
    const queryTrigger = true;

    if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
      const result = PhysicsSystem.instance.raycastClosestResult;
      const collider = result.collider;
      const node = collider.node;

      if (node.name == "Shelf") {
        this.SelectedNode = node;
        if (this.SelectedNode.getSiblingIndex() == 4) {
          this.touchselection(node);
        } else {
          if (this.tileCreation.HexArray[this.SelectedNode.getSiblingIndex() + 1][0] == -1) {
            this.touchselection(node);
          } else {
            this.SelectedNode = null;
          }
        }
      }
    }
  }

  touchselection(node) {
    this.InitialAngle = node.eulerAngles.y;
    let selctNode = this.HelixParentNode.children[this.SelectedNode.getSiblingIndex()].children[this.tileCreation.setIdexArray[this.SelectedNode.getSiblingIndex()][0]];
    let selectNodePos = selctNode.getPosition();
    selctNode.setPosition(selectNodePos.x, this.SelectedNode.getSiblingIndex() * 0, selectNodePos.z);
  }

  onTouchMove(event: EventTouch) {
    if (this.SelectedNode === null) return;
    if (this.SelectedNode.name === "Shelf") {
      const mousePos = event.getLocation();
      let angle = (mousePos.x - this.StartingPoint) / 2;
      this.SelectedNode.setRotationFromEuler(0, this.InitialAngle + angle, 0);
    }
  }

  onTouchEnd(event) {
    if (this.SelectedNode === null) return;
    if (this.SelectedNode.name == "Shelf") {
      const angle = this.InitialAngle;
      let getAngle = this.calculateRotation(angle, this.SelectedNode.eulerAngles.y);
      let fixedAngle = this.FixRotPos(this.SelectedNode.eulerAngles.y);
      let fixedArrayAngle = this.FixRotPos(getAngle);
      this.SelectedNode.setRotationFromEuler(0, fixedAngle, 0);
      this.tileCreation.changeinArray(this.SelectedNode.getSiblingIndex(), fixedArrayAngle);
      let selctNode = this.HelixParentNode.children[this.SelectedNode.getSiblingIndex()].children[this.tileCreation.setIdexArray[this.SelectedNode.getSiblingIndex()][0]];
      let selectNodePos = selctNode.getPosition();
      let colordata = this.tileCreation.HexArray[this.SelectedNode.getSiblingIndex()][0];
      if (this.SelectedNode.getSiblingIndex() == 0 ||  this.placeOnSegment(this.SelectedNode.getSiblingIndex()) == 0) {
        selctNode.setPosition(selectNodePos.x, this.SelectedNode.getSiblingIndex() * -0.05, selectNodePos.z);
      } else {
        selctNode.setPosition(selectNodePos.x, (this.placeOnSegment(this.SelectedNode.getSiblingIndex()) * 6 + 1) * -0.05, selectNodePos.z);
        let parant = this.HelixParentNode.children[this.SelectedNode.getSiblingIndex() - this.placeOnSegment(this.SelectedNode.getSiblingIndex())].children[this.tileCreation.setIdexArray[this.SelectedNode.getSiblingIndex() - this.placeOnSegment(this.SelectedNode.getSiblingIndex())][0]];
        for (let i = 0; i < 5; i++) {
          if (selctNode.children.length > 0) {
            selctNode.children[0].setPosition(0, i * 0.05, 0);
            selctNode.children[0].parent = parant;
            parant.setPosition(parant.position.x, (this.SelectedNode.getSiblingIndex() - this.placeOnSegment(this.SelectedNode.getSiblingIndex())) * -0.05, parant.position.z);
          }
        }
        this.tileCreation.HexArray[this.SelectedNode.getSiblingIndex()][0] = -1;
        this.tileCreation.HexArray[this.SelectedNode.getSiblingIndex() - this.placeOnSegment(this.SelectedNode.getSiblingIndex())][0] = colordata;
      }
    }
    this.SelectedNode = null;
  }

  placeOnSegment(slected) {
    let j = [];
    for (let i = slected; i > 0; i--) {
      let selectArray = this.tileCreation.HexArray[i - 1][0];
      if (selectArray == -1) {
        j.push(i - 1);
      } else {
        if (j.length == 0) return 0;
      }
    }
    return slected - j[j.length - 1];
  }

  FixRotPos(n) {
    return Math.round(n / 20) * 20;
  }

  calculateRotation(fromAngle: number, toAngle: number): number {
    let rotation = toAngle - fromAngle;
    if (rotation > 180) rotation -= 360;
    else if (rotation < -180) rotation += 360;
    return rotation;
  }

  openGameLink() {
    window.open("https://play.google.com/store/apps/details?id=com.gamebrain.hexasort", "HexaSort");
  }
}