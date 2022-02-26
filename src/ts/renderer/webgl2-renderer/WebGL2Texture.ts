import AbstractTexture, {AbstractTextureParams} from "~/renderer/abstract-renderer/AbstractTexture";
import WebGL2Renderer from "~/renderer/webgl2-renderer/WebGL2Renderer";
import {RendererTypes} from "~/renderer/RendererTypes";
import WebGL2Constants from "~/renderer/webgl2-renderer/WebGL2Constants";

export default abstract class WebGL2Texture implements AbstractTexture {
	public width: number;
	public height: number;
	public anisotropy: number;
	public minFilter: RendererTypes.MinFilter;
	public magFilter: RendererTypes.MagFilter;
	public wrap: RendererTypes.TextureWrap;
	public format: RendererTypes.TextureFormat;
	public flipY: boolean;
	public mipmaps: boolean;
	protected abstract textureTypeConstant: number;
	protected renderer: WebGL2Renderer;
	protected gl: WebGL2RenderingContext;
	public WebGLTexture: WebGLTexture;
	protected deleted: boolean = false;

	protected constructor(
		renderer: WebGL2Renderer,
		{
			width,
			height,
			anisotropy = 1,
			minFilter = RendererTypes.MinFilter.Nearest,
			magFilter = RendererTypes.MagFilter.Nearest,
			wrap = RendererTypes.TextureWrap.ClampToEdge,
			format,
			flipY = false,
			mipmaps = false
		}: AbstractTextureParams
	) {
		this.width = width;
		this.height = height;
		this.anisotropy = anisotropy;
		this.minFilter = minFilter;
		this.magFilter = magFilter;
		this.wrap = wrap;
		this.format = format;
		this.flipY = flipY;
		this.mipmaps = mipmaps;

		this.renderer = renderer;
		this.gl = renderer.gl;

		this.createWebGLTexture();
	}

	private createWebGLTexture() {
		this.WebGLTexture = this.gl.createTexture();
	}

	public bind() {
		this.gl.bindTexture(this.textureTypeConstant, this.WebGLTexture);
	}

	public unbind() {
		this.gl.bindTexture(this.textureTypeConstant, null);
	}

	public updateWrapping() {
		const wrapConstant = WebGL2Texture.convertWrapToWebGLConstant(this.wrap);

		this.renderer.bindTexture(this);
		this.gl.texParameteri(this.textureTypeConstant, WebGL2Constants.TEXTURE_WRAP_S, wrapConstant);
		this.gl.texParameteri(this.textureTypeConstant, WebGL2Constants.TEXTURE_WRAP_T, wrapConstant);
	}

	public updateFilters() {
		const minFilterConstant = WebGL2Texture.convertMinFilterToWebGLConstant(this.minFilter);
		const magFilterConstant = WebGL2Texture.convertMagFilterToWebGLConstant(this.magFilter);

		this.renderer.bindTexture(this);
		this.gl.texParameteri(this.textureTypeConstant, WebGL2Constants.TEXTURE_MIN_FILTER, minFilterConstant);
		this.gl.texParameteri(this.textureTypeConstant, WebGL2Constants.TEXTURE_MAG_FILTER, magFilterConstant);
	}

	public updateFlipY() {
		this.gl.pixelStorei(WebGL2Constants.UNPACK_FLIP_Y_WEBGL, this.flipY);
	}

	public generateMipmaps() {
		if (this.mipmaps) {
			this.renderer.bindTexture(this);
			this.gl.generateMipmap(this.textureTypeConstant);
		}
	}

	public updateAnisotropy() {
		const extension = this.renderer.extensions.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT;

		this.renderer.bindTexture(this);
		this.gl.texParameterf(this.textureTypeConstant, extension, this.anisotropy);
	}

	public delete() {
		this.gl.deleteTexture(this.WebGLTexture);
		this.deleted = true;
	}

	static convertWrapToWebGLConstant(wrap: RendererTypes.TextureWrap): number {
		switch (wrap) {
			case RendererTypes.TextureWrap.ClampToEdge:
				return WebGL2Constants.CLAMP_TO_EDGE;
			case RendererTypes.TextureWrap.Repeat:
				return WebGL2Constants.REPEAT;
			case RendererTypes.TextureWrap.MirroredRepeat:
				return WebGL2Constants.MIRRORED_REPEAT;
		}

		return WebGL2Constants.CLAMP_TO_EDGE;
	}

	static convertMinFilterToWebGLConstant(minFilter: RendererTypes.MinFilter): number {
		switch (minFilter) {
			case RendererTypes.MinFilter.Nearest:
				return WebGL2Constants.NEAREST;
			case RendererTypes.MinFilter.Linear:
				return WebGL2Constants.LINEAR;
			case RendererTypes.MinFilter.NearestMipmapNearest:
				return WebGL2Constants.NEAREST_MIPMAP_NEAREST;
			case RendererTypes.MinFilter.LinearMipmapNearest:
				return WebGL2Constants.LINEAR_MIPMAP_NEAREST;
			case RendererTypes.MinFilter.NearestMipmapLinear:
				return WebGL2Constants.NEAREST_MIPMAP_LINEAR;
			case RendererTypes.MinFilter.LinearMipmapLinear:
				return WebGL2Constants.LINEAR_MIPMAP_LINEAR;
		}

		return WebGL2Constants.NEAREST;
	}

	static convertMagFilterToWebGLConstant(magFilter: RendererTypes.MagFilter): number {
		switch (magFilter) {
			case RendererTypes.MagFilter.Nearest:
				return WebGL2Constants.NEAREST;
			case RendererTypes.MagFilter.Linear:
				return WebGL2Constants.LINEAR;
		}

		return WebGL2Constants.NEAREST;
	}

	static convertFormatToWebGLConstants(format: RendererTypes.TextureFormat): {
		format: number,
		internalFormat: number,
		type: number
	} {
		switch (format) {
			case RendererTypes.TextureFormat.R8Unorm:
				return {
					format: WebGL2Constants.RED,
					internalFormat: WebGL2Constants.R8,
					type: WebGL2Constants.UNSIGNED_BYTE
				};
			case RendererTypes.TextureFormat.RG8Unorm:
				return {
					format: WebGL2Constants.RG,
					internalFormat: WebGL2Constants.RG8,
					type: WebGL2Constants.UNSIGNED_BYTE
				};
			case RendererTypes.TextureFormat.RGB8Unorm:
				return {
					format: WebGL2Constants.RGB,
					internalFormat: WebGL2Constants.RGB8,
					type: WebGL2Constants.UNSIGNED_BYTE
				};
			case RendererTypes.TextureFormat.RGBA8Unorm:
				return {
					format: WebGL2Constants.RGBA,
					internalFormat: WebGL2Constants.RGBA8,
					type: WebGL2Constants.UNSIGNED_BYTE
				};
			case RendererTypes.TextureFormat.Depth32Float:
				return {
					format: WebGL2Constants.DEPTH_COMPONENT,
					internalFormat: WebGL2Constants.DEPTH_COMPONENT32F,
					type: WebGL2Constants.FLOAT
				};
		}

		return {
			format: WebGL2Constants.RGBA,
			internalFormat: WebGL2Constants.RGBA8,
			type: WebGL2Constants.UNSIGNED_BYTE
		};
	}
}