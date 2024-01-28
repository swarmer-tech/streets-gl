import RenderSystem from "./systems/RenderSystem";
import TileSystem from "./systems/TileSystem";
import ControlsSystem from "./systems/ControlsSystem";
import PickingSystem from "./systems/PickingSystem";
import CursorStyleSystem from './systems/CursorStyleSystem';
import SystemManager from "./SystemManager";
import TileObjectsSystem from "./systems/TileObjectsSystem";
import TileLoadingSystem from "./systems/TileLoadingSystem";
import MapWorkerSystem from "./systems/MapWorkerSystem";
import MapTimeSystem from "./systems/MapTimeSystem";
import UISystem from "./systems/UISystem";
import SceneSystem from './systems/SceneSystem';
import ResourceLoader, {ResourceJSON} from './world/ResourceLoader';
import resourcesList from '../resources/resources.json';
import VehicleSystem from "./systems/VehicleSystem";
import TerrainSystem from "./systems/TerrainSystem";
import SettingsSystem from "~/app/systems/SettingsSystem";
import SlippyMapSystem from "~/app/systems/SlippyMapSystem";

class App {
    private loop = (deltaTime: number): void => this.update(deltaTime);
    private time = 0;
    public paused = false;
    public systemManager: SystemManager;

    public constructor() {
        this.init();
    }

    private init(): void {
        this.systemManager = new SystemManager();

        this.systemManager.addSystems(SettingsSystem);
        this.systemManager.addSystems(UISystem);

        ResourceLoader.addFromJSON(resourcesList as ResourceJSON);
        ResourceLoader.load({
            onFileLoad: (loaded: number, total: number) => {
                document.getElementById('ui').innerText = `${loaded} / ${total}`
                // this.systemManager.getSystem(UISystem).setResourcesLoadingProgress(loaded / total);
            },
            onLoadedFileNameChange: (name: string) => {
                // this.systemManager.getSystem(UISystem).setResourceInProgressPath(name);
            }
        }).then(() => {
            this.systemManager.addSystems(
                ControlsSystem,
                MapTimeSystem,
                TerrainSystem,
                TileSystem,
                SceneSystem,
                CursorStyleSystem,
                PickingSystem,
                TileObjectsSystem,
                SlippyMapSystem,
                VehicleSystem,
                RenderSystem,
                MapWorkerSystem,
                TileLoadingSystem,
            );
            document.getElementById('ui').innerHTML = ``;
            const btn = document.createElement('button');
            btn.innerText = 'Start';
            btn.onclick = ():void => {
                if ((window as any).isProcessing()) {
                    btn.innerText = 'Start';
                    (window as any).stop();
                } else {
                    btn.innerText = 'Stop';
                    (window as any).start();
                }
            }
            document.getElementById('ui').appendChild(btn);
        });
        this.update();
    }

    public get scene(): any {
        return this.systemManager.getSystem(SceneSystem);
    }

    public get controls(): any {
        return this.systemManager.getSystem(ControlsSystem);
    }

    public update(rafTime = 0): void {
        requestAnimationFrame(this.loop);

        if (this.paused) {
            return;
        }
        // const frameStart = performance.now();
        const deltaTime = (rafTime - this.time) / 1e3;
        this.time = rafTime;

        this.systemManager.updateSystems(deltaTime);

        // const frameTime = performance.now() - frameStart;
        // this.systemManager.getSystem(UISystem).updateFrameTime(frameTime);
    }
}

declare global {
    interface Window {
        app: App;
    }
}
window.app = new App();
export default window.app;
