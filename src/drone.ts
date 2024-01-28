import MathUtils from "~/lib/math/MathUtils";
import Config from "~/app/Config";
import {IDroneCoordinates} from "~/drone.types";

export const IMG_WIDTH = 640;
export const IMG_HEIGHT = 480;
export const GET_URL = 'http://localhost:3000/get_coordinates';
export const POST_URL = 'http://localhost:3000/save_image';
export const REQUESTS_PER_SECOND = 5;
export const DOWNLOAD_IMAGES = false;

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

function moveCamera(lat: number, lon: number, alt: number, pitch: number, yaw: number, fov: number = 80): void {
    const {app, camera, controls} = useApp();

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

function downloadCanvasData(data: string, name: string = 'canvas.jpg'): void {
    const a = document.createElement('a');
    a.download = name;
    a.href = data;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function getCanvasData(): string {
    const MIME_TYPE = "image/jpeg";
    const QUALITY = 0.8;
    return canvas.toDataURL(MIME_TYPE, QUALITY);
}

async function fetchDroneCoordinates(): Promise<typeof IDroneCoordinates> {
    return (await fetch(GET_URL)).json() as IDroneCoordinates;
}

async function postImage(base64data: string): Promise<void> {
    await fetch(POST_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({base64data})
    });
}

function addToLog(imageData: string): void {
    const img = document.createElement('img');
    img.src = imageData;
    img.onclick = (): void => downloadCanvasData(imageData);
    document.getElementById('log').prepend(img);
    while (document.getElementById('log').children.length > 1) {
        document.getElementById('log').removeChild(document.getElementById('log').children[document.getElementById('log').children.length - 1]);
    }
}

async function processDronePosition(downloadImage?: boolean): Promise<void> {
    const coordinates = await fetchDroneCoordinates();
    moveCamera(parseFloat(String(coordinates.lattitude)), parseFloat(String(coordinates.longtitude)), parseFloat(String(coordinates.altitude)), coordinates.pitch, coordinates.yaw, coordinates.camera_horizontal_fov);
    const imageData = getCanvasData();
    downloadImage && downloadCanvasData(imageData);
    addToLog(imageData);
    await postImage(imageData);
}

let interval: Timeout | null = null;

function isProcessing(): boolean {
    return interval !== null;
}

function start(): void {
    interval = setInterval(() => processDronePosition(DOWNLOAD_IMAGES), 1000 / REQUESTS_PER_SECOND);
}

function stop(): void {
    interval !== null && clearInterval(interval);
    interval = null;
}


(window as any).moveCamera = moveCamera;
(window as any).getCanvasData = getCanvasData;
(window as any).downloadCanvasData = downloadCanvasData;
(window as any).fetchDroneCoordinates = fetchDroneCoordinates;
(window as any).processDronePosition = processDronePosition;
(window as any).isProcessing = isProcessing;
(window as any).start = start;
(window as any).stop = stop;
