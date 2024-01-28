export const IMG_WIDTH = 640;
export const IMG_HEIGHT = 480;

const canvas = document.getElementById('canvas');

canvas.style.width = `${IMG_WIDTH / window.devicePixelRatio}px`;
canvas.style.height = `${IMG_HEIGHT / window.devicePixelRatio}px`;
