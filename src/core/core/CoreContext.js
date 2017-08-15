/**
 * Copyright Metrological, 2017
 */

class CoreContext {

    constructor(stage) {
        this.stage = stage

        this.root = null

        this.updateTreeOrder = 0
        this.updateTreeOrderForceUpdate = 0

        this.shaderPrograms = new Map()


        this._renderState = new CoreRenderState(this)

        this._renderExecutor = new CoreRenderExecutor(this)

        this._renderTexturePool = []

        let DefaultShader = require('../DefaultShader');
        this.defaultShader = new DefaultShader(this);

    }

    destroy() {
        this.shaderPrograms.forEach(shaderProgram => shaderProgram.destroy())
        this._renderTexturePool.forEach(texture => this._freeRenderTexture(texture));
    }

    layout() {
        this.root.layout()
    }

    frame() {
        if (!this.root._parent._hasRenderUpdates) {
            return false
        }

        this.layout()

        this.update()

        this.render()

        // Clear flag to identify if anything changes before the next frame.
        this.root._parent._hasRenderUpdates = false

        return true
    }

    update() {
        this.updateTreeOrderForceUpdate = 0
        this.updateTreeOrder = 0

        this.updateRttContext = null
        this.updateRttContextStack = []

        this.root.update()
    }

    setUpdateRttContext(viewCore) {
        this.updateRttContextStack.push(this.updateRttContext)
        this.updateRttContext = viewCore
    }

    restoreUpdateRttContext() {
        this.updateRttContext = this.updateRttContextStack.pop()
    }

    render() {
        this.state.reset()
        //@todo: fill the render state from the render tree
        //@todo: reset & run the render executor

        this._freeUnusedRenderTextures();


    }

    allocateRenderTexture(w, h) {
        for (let i = 0, n = this._renderTexturePool.length; i < n; i++) {
            let texture = this._renderTexturePool[i];
            if (texture.w === w && texture.h === h) {
                texture.f = this.stage.frameCounter;
                this._renderTexturePool.splice(i, 1);
                return texture;
            }
        }

        let texture = this._createRenderTexture(w, h);
        texture.f = this.stage.frameCounter;

        return texture;
    }

    releaseRenderTexture(texture) {
        this._renderTexturePool.push(texture);
        texture.f = this.stage.frameCounter;
    }

    _freeUnusedRenderTextures() {
        // Clean up all textures that are no longer used.
        // This cache is short-lived because it is really just meant to supply running shaders and filters that are
        // updated during a number of frames.
        let limit = this.stage.frameCounter - 60;
        this._renderTexturePool.filter(texture => {
            if (texture.f < limit) {
                this._freeRenderTexture(texture);
                return false;
            }
            return true;
        });
    }

    _createRenderTexture(w, h) {
        let gl = this.gl;

        let sourceTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // We need a specific framebuffer for every render texture.
        sourceTexture.framebuffer = gl.createFramebuffer();
        sourceTexture.w = w;
        sourceTexture.h = h;
        sourceTexture.projectionMatrix = new Float32Array([
            2/w, 0, 0, 0,
            0, 2/h, 0, 0,
            0, 0, 1, 0,
            -1, -1, 0, 1
        ]);

        this.setRenderTarget(sourceTexture)
        this._commitRenderTarget()
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sourceTexture, 0);
        this.restoreRenderTarget()

        // We do not need to worry about restoring the framebuffer: we can rely on _commitRenderTarget to do this.
        return sourceTexture;
    }

    _freeRenderTexture(glTexture) {
        let gl = this.stage.gl;
        gl.deleteFramebuffer(glTexture.framebuffer);
        gl.deleteTexture(glTexture);
    }

}

module.exports = CoreContext

let CoreRenderState = require('./CoreRenderState')
let CoreRenderExecutor = require('./CoreRenderExecutor')