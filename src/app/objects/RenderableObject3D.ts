import Object3D from "~/lib/core/Object3D";
import AbstractMesh from "~/lib/renderer/abstract-renderer/AbstractMesh";
import AbstractRenderer from '~/lib/renderer/abstract-renderer/AbstractRenderer';
import Camera from "~/lib/core/Camera";
import Vec3 from "~/lib/math/Vec3";
import AABB3D from "~/lib/math/AABB3D";

export default abstract class RenderableObject3D extends Object3D {
	public abstract mesh: AbstractMesh;
	public boundingBox: AABB3D;

	public abstract updateMesh(renderer: AbstractRenderer): void;

	public abstract isMeshReady(): boolean;

	public draw(): void {
		this.mesh.draw();
	}

	public setBoundingBox(min: Vec3, max: Vec3): void {
		this.boundingBox = new AABB3D(min, max);
	}

	public inCameraFrustum(camera: Camera): boolean {
		if (this.boundingBox) {
			const planes = camera.frustumPlanes;

			for (let i = 0; i < 6; ++i) {
				const plane = planes[i];

				const viewSpaceAABB = this.boundingBox.toSpace(this.matrixWorld);

				const point = new Vec3(
					plane.x > 0 ? viewSpaceAABB.max.x : viewSpaceAABB.min.x,
					plane.y > 0 ? viewSpaceAABB.max.y : viewSpaceAABB.min.y,
					plane.z > 0 ? viewSpaceAABB.max.z : viewSpaceAABB.min.z
				);

				if (plane.distanceToPoint(point) < 0) {
					return false;
				}
			}

			return true;
		} else {
			throw new Error('RenderableObject has no bbox');
		}
	}
}