import Node from "./Node";
import ResourceDescriptor from "./ResourceDescriptor";
import PhysicalResourceBuilder from "./PhysicalResourceBuilder";
import PhysicalResource from "./PhysicalResource";

export default abstract class Resource extends Node {
	public isRenderable: boolean = false;
	public descriptor: ResourceDescriptor;
	public physicalResourceBuilder: PhysicalResourceBuilder;
	public isTransient: boolean;
	public isUsedExternally: boolean;

	protected constructor(
		{
			name,
			descriptor,
			physicalResourceBuilder,
			isTransient,
			isUsedExternally
		}: {
			name: string,
			descriptor: ResourceDescriptor,
			physicalResourceBuilder: PhysicalResourceBuilder,
			isTransient: boolean,
			isUsedExternally: boolean
		}
	) {
		super(name);

		this.descriptor = descriptor;
		this.physicalResourceBuilder = physicalResourceBuilder;
		this.isTransient = isTransient;
		this.isUsedExternally = isUsedExternally;
	}

	public createPhysicalResource(): PhysicalResource {
		return this.physicalResourceBuilder.createFromResourceDescriptor(this.descriptor);
	}
}