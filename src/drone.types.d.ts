export interface IDroneCoordinates {
    lattitude: string | number,
    longtitude: string | number,
    "altitude": string | number,
    "drone_id": string,
    "yaw": string | number,
    "pitch": string | number,
    "roll": string | number,
    "heading": string | number,
    "camera_yaw": string | number,
    "camera_roll": string | number,
    "camera_pitch": string | number,
    "camera_horizontal_fov": string | number,
    "camera_vertical_fov": string | number,
    "camera_infrared": boolean
}
