import MathUtils from "~/lib/math/MathUtils";
import Config from "~/app/Config";

export const IMG_WIDTH = 640;
export const IMG_HEIGHT = 480;

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
canvas.style.width = `${IMG_WIDTH / window.devicePixelRatio}px`;
canvas.style.height = `${IMG_HEIGHT / window.devicePixelRatio}px`;

function useApp(): any {
    const app = window.app;
    const scene = app.scene;
    const controls = app.controls;
    const camera = scene.objects.camera;
    return {app, scene, controls, camera};
}

function moveCamera(lat: number, lon: number, alt: number, pitch: number, yaw: number, fov: number = 80):void {
    const { app, camera, controls } = useApp();

    const position = MathUtils.degrees2meters(MathUtils.clamp(lat, -85.051129, 85.051129), MathUtils.clamp(lon, -180, 180));
    camera.position.x = position.x;
    camera.position.z = position.y;

    controls.freeNavigator.pitch = MathUtils.toRad(MathUtils.clamp(pitch, Config.MinCameraPitch, Config.MaxCameraPitch));
    controls.freeNavigator.yaw = MathUtils.toRad(MathUtils.clamp(yaw, 0, 360));

    camera.position.y = controls.freeNavigator.getHeightmapValueAtPosition(position.x, position.y) + alt;

    camera.fov = fov;
    camera.updateProjectionMatrix();

    app.systemManager.updateSystems(1);
}

function getCanvasData(): string {
    const MIME_TYPE = "image/jpeg";
    const QUALITY = 0.8;
    return canvas.toDataURL(MIME_TYPE, QUALITY);
}

function downloadCanvasData(): void {
    const a = document.createElement('a');
    a.download = 'canvas.jpg';
    a.href = getCanvasData();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

(window as any).moveCamera = moveCamera;
(window as any).getCanvasData = getCanvasData;
(window as any).downloadCanvasData = downloadCanvasData;
