var $jscomp = $jscomp || {};

$jscomp.scope = {};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, d, e) { a != Array.prototype && a != Object.prototype && (a[d] = e.value) };
$jscomp.getGlobal = function (a) { return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a };
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function (a, d, e, b) {
  if (d) {
    e = $jscomp.global;
    a = a.split(".");
    for (b = 0;
      b < a.length - 1;
      b++) {
      var g = a[b];
      g in e || (e[g] = {});
      e = e[g]
    } a = a[a.length - 1];
    b = e[a];
    d = d(b);
    d != b && null != d && $jscomp.defineProperty(e, a, { configurable: !0, writable: !0, value: d })
  }
};
$jscomp.polyfill("Object.is", function (a) { return a ? a : function (a, e) { return a === e ? 0 !== a || 1 / a === 1 / e : a !== a && e !== e } }, "es6", "es3");
$jscomp.polyfill("Array.prototype.includes", function (a) {
  return a ? a : function (a, e) {
    var b = this;
    b instanceof String && (b = String(b));
    var d = b.length;
    e = e || 0;
    for (0 > e && (e = Math.max(e + d, 0));
      e < d;
      e++) {
      var l = b[e];
      if (l === a || Object.is(l, a)) return !0
    } return !1
  }
}, "es7", "es3");
$jscomp.checkStringArgs = function (a, d, e) {
  if (null == a) throw new TypeError("The 'this' value for String.prototype." + e + " must not be null or undefined");
  if (d instanceof RegExp) throw new TypeError("First argument to String.prototype." + e + " must not be a regular expression");
  return a + ""
};
$jscomp.polyfill("String.prototype.includes", function (a) { return a ? a : function (a, e) { return -1 !== $jscomp.checkStringArgs(this, a, "includes").indexOf(a, e || 0) } }, "es6", "es3");

var HoloVideoObject = function (a, d, e) {
  this.id = HoloVideoObject._instanceCounter++;
  this.state = HoloVideoObject.States.Empty;
  this.suspended = !1;
  this.gl = a;
  this.audioVolume = this.logLevel = 1;
  this.videoElements = [];
  this.errorCallback = e;
  d ? (this.createOptions = d, 2 > d.numAsyncFrames && (this._logWarning("numAsyncFrames must be at least 2 (" + d.numAsyncFrames + " specified)"), this.createOptions.numAsyncFrames = 2)) : this.createOptions = {};
  this.createOptions.numAsyncFrames || (this.createOptions.numAsyncFrames = 3);
  document.addEventListener("visibilitychange",
    function () { document.hidden ? this.state == HoloVideoObject.States.Playing ? (this.wasPlaying = !0, this._logInfo("document hidden -> pausing playback"), this.pause()) : this.wasPlaying = !1 : this.wasPlaying && (this.wasPlaying = !1, this._logInfo("document visible -> resuming playback"), this.play()) }.bind(this));
  d = a.canvas;
  d.addEventListener("webglcontextlost", function (b) {
    this.contextLost = !0;
    this.wasPlaying = this.state == HoloVideoObject.States.Playing;
    this.pause();
    this._logInfo("webglcontextlost -> pausing playback");
    this._releaseWebGLResources(a)
  }.bind(this), !1);
  d.addEventListener("webglcontextrestored", function (a) {
    this._initializeWebGLResources(this.gl);
    if (this.json && this.outputBuffers) {
      a = this.json.extensions[HoloVideoObject._extName];
      for (var b = this.gl, d = b.getParameter(b.ARRAY_BUFFER_BINDING), e = 0;
        3 > e;
        ++e)b.bindBuffer(b.ARRAY_BUFFER, this.outputBuffers[e]), b.bufferData(b.ARRAY_BUFFER, 12 * a.maxVertexCount, b.STREAM_COPY);
      b.bindBuffer(b.ARRAY_BUFFER, d)
    } this.contextLost = !1;
    this.wasPlaying && (this.wasPlaying = !1, this._logInfo("webglcontextrestored -> resuming playback"),
      this.play())
  }.bind(this), !1);
  console.log("HoloVideoObject version " + HoloVideoObject.Version.String);
  this._initializeWebGLResources(a)
};

HoloVideoObject.prototype._createProgram = function (a, d, e, b) {
  function g(a, b, c) {
    c = a.createShader(c);
    a.shaderSource(c, b);
    a.compileShader(c);
    return c
  } var l = a.createProgram();
  d = g(a, d, a.VERTEX_SHADER);
  a.attachShader(l, d);
  a.deleteShader(d);
  e = g(a, e, a.FRAGMENT_SHADER);
  a.attachShader(l, e);
  a.deleteShader(e);
  b && b(l);
  a.linkProgram(l);
  (b = a.getProgramInfoLog(l)) && this._logError(b);
  (b = a.getShaderInfoLog(d)) && this._logError(b);
  (b = a.getShaderInfoLog(e)) && this._logError(b);
  return l
};

HoloVideoObject.prototype._loadJSON = function (a, d) {
  var e = this, b = new XMLHttpRequest;
  b.overrideMimeType("application/json");
  b.onreadystatechange = function () { 4 == b.readyState && 200 == b.status ? d(b.responseText, e) : 400 <= b.status && (e._logError("_loadJSON failed for: " + a + ", XMLHttpRequest status = " + b.status), e._onError(HoloVideoObject.ErrorStates.NetworkError)) };
  b.onerror = function () {
    e._logError("_loadJSON XMLHttpRequest error for: " + a + ", status = " + b.status);
    e._onError(HoloVideoObject.ErrorStates.NetworkError)
  };
  b.open("GET", a, !0);
  b.send(null);
  return b.responseText
};

HoloVideoObject.prototype._loadArrayBuffer = function (a, d) {
  var e = this, b = new XMLHttpRequest;
  b.name = a.substring(a.lastIndexOf("/") + 1, a.length);
  b.responseType = "arraybuffer";
  b.onprogress = function (a) { };
  b.onreadystatechange = function () {
    if (4 == b.readyState) {
      if (200 == b.status) {
        var g = b.response;
        g && d && d(g)
      } else 400 <= b.status ? (e._logError("_loadArrayBuffer failed for: " + a + ", XMLHttpRequest status = " + b.status), e._onError(HoloVideoObject.ErrorStates.NetworkError)) : e._logWarning("_loadArrayBuffer unexpected status = " +
        b.status);
      e.httpRequest == b && (e.httpRequest = null)
    }
  };
  b.ontimeout = function () {
    e._logError("_loadArrayBuffer timeout");
    e._onError(HoloVideoObject.ErrorStates.NetworkError)
  };
  b.open("GET", a, !0);
  b.send(null);
  this.httpRequest = b
};

HoloVideoObject.prototype._startPlaybackIfReady = function () {
  this.state == HoloVideoObject.States.Opening ? this.buffersLoaded >= this.minBuffers && this.videosLoaded >= this.minVideos && (this._logInfo("state -> Opened"), this.state = HoloVideoObject.States.Opened, this.openOptions.autoplay ? this.play() : this.seekingAutoPlay && (delete this.seekingAutoPlay, this.play())) : this.seekingAutoPlay && this.buffersLoaded >= this.minBuffers && this.videosLoaded >= this.minVideos && (delete this.seekingAutoPlay, this.play());
  if (this.suspended) {
    var a =
      this._currentVideo();
    !a.paused && a.playing || !a.preloaded || (this._logInfo("video " + a.mp4Name + " was suspended, resuming"), this.suspended = !1, a.play())
  } else this.state == HoloVideoObject.States.Playing && (a = this._currentVideo(), a.playing || a.play())
};

HoloVideoObject.prototype._isBufferAlreadyLoaded = function (a) {
  for (var d = 0;
    d < this.buffers.length;
    ++d)if (this.buffers[d] && this.buffers[d].bufferIndex == a) return !0;
  return !1
};

HoloVideoObject.prototype._loadNextBuffer = function () {
  if (0 == this.freeArrayBuffers.length) this.openOptions.keepAllMeshesInMemory ? this._logInfo("All meshes loaded.") : this._logInfo("_loadNextBuffer: Waiting for next free buffer...");
  else {
    var a = void 0;
    this.seekingStartBufferIndex && this.fallbackFrameBuffer ? (a = this.nextBufferLoadIndex = this.seekingStartBufferIndex, delete this.seekingStartBufferIndex) : a = this.nextBufferLoadIndex;
    if (this.seekingStartBufferIndex) this.nextBufferLoadIndex = this.seekingStartBufferIndex,
      delete this.seekingStartBufferIndex;
    else {
      do this.nextBufferLoadIndex = (this.nextBufferLoadIndex + 1) % this.json.buffers.length;
      while (this._isBufferAlreadyLoaded(this.nextBufferLoadIndex))
    } this.fallbackFrameBuffer && 0 == this.nextBufferLoadIndex && (this.nextBufferLoadIndex = 1);
    var d = this.json.buffers[a], e = this.urlRoot + d.uri;
    d.loaded = !1;
    var b = -1;
    0 == a ? this._logInfo("loading preview frame buffer") : (b = this.freeArrayBuffers.shift(), this._logInfo("loading buffer: " + d.uri + " into slot " + b));
    this.pendingBufferDownload =
      !0;
    this._loadArrayBuffer(e, function (e) { this.fallbackFrameBuffer || this.filledFallbackFrame ? (this._logInfo("buffer loaded: " + d.uri + " into slot " + b), ++this.buffersLoaded, this.buffers[b] = e, e.bufferIndex = a, d.arrayBufferIndex = b, d.loaded = !0, this.needMeshData = this.pendingBufferDownload = !1, this._startPlaybackIfReady(), this._loadNextBuffer()) : (this._logInfo("fallback frame buffer downloaded " + d.uri), this.fallbackFrameBuffer = e, this._loadNextBuffer(), this.pendingBufferDownload = !1) }.bind(this))
  }
};

HoloVideoObject.prototype._setSeekTarget = function (a) {
  this.seekTargetTime = a;
  this.searchStartFrame = this._computeSeekSearchFrame(this.seekTargetTime);
  this.seeking = !0;
  a = this.frameIndex / this.json.extensions[HoloVideoObject._extName].framerate;
  if (this.searchStartFrame != this.lastKeyframe || this.seekTargetTime < a) this.requestKeyframe = !0
};

HoloVideoObject.prototype._frameIsKeyframe = function (a) { return void 0 != this.meshFrames[a].indices };

HoloVideoObject.prototype._computeSeekSearchFrame = function (a) {
  for (var d = this.json.extensions[HoloVideoObject._extName], e = d.keyframes, b = e.length - 1;
    0 <= b;
    --b)if (e[b] / d.framerate <= a) return e[b];
  return 0
};

HoloVideoObject.prototype._computeSeekSearchTime = function (a) {
  var d = this.json.extensions[HoloVideoObject._extName];
  return this._computeSeekSearchFrame(a) / d.framerate
};

HoloVideoObject.prototype._currentVideo = function () { return this.json.images[this.json.extensions[HoloVideoObject._extName].timeline[this.currentVideoIndex].image].video };

HoloVideoObject.prototype.seekToTime = function (a, d) {
  if (this.seeking) this._logWarning("seekToTime: ignoring request due to prior seek in-progress");
  else {
    this.httpRequest && (this.httpRequest.abort(), this.httpRequest = null);
    var e = this._currentVideo(), b = !1;
    this.state == HoloVideoObject.States.Playing && (b = !0, this.pause(), e.playing = !1, this.seekingAutoPlay = !0);
    this._setSeekTarget(a);
    for (var g = this.json.bufferViews[this.meshFrames[this.searchStartFrame].indices.bufferView].buffer, l = [], f = g, m = 0;
      m < Math.min(this.openOptions.maxBuffers,
        this.json.buffers.length);
      ++m)0 == f && (f = 1), l.push(f), f = (f + 1) % this.json.buffers.length;
    f = !0;
    this.currentBufferIndex = -1;
    this.buffersLoaded = 0;
    m = [];
    for (var c = 0;
      c < this.buffers.length;
      ++c) {
      var p = this.buffers[c].bufferIndex;
      p == g && (f = !1, this.currentBufferIndex = c);
      -1 == l.indexOf(p) ? m.push(c) : ++this.buffersLoaded
    } this.openOptions.keepAllMeshesInMemory || (this.freeArrayBuffers = m);
    f && (this.seekingStartBufferIndex = g);
    !b && d && (this.pauseAfterSeek = this.seekingAutoPlay = !0);
    this.oldVideoSampleIndex = this.lastVideoSampleIndex;
    this.nextPbo = 0;
    this.lastVideoSampleIndex = -1;
    this.requestKeyframe && (this.lastKeyframe = -1, this.prevPrevMesh = this.prevMesh = this.curMesh = this.lastKeyframeUVs = this.lastKeyframeIndices = null);
    this._setVideoStartTime(e);
    0 == m.length ? this._startPlaybackIfReady() : this._loadNextBuffer();
    this._logDebug("seekToTime: targetTime = " + a + ", search start = " + this.searchStartFrame + " (in buffer " + g + ")")
  }
};

HoloVideoObject.prototype._setVideoStartTime = function (a) {
  if (this.seekTargetTime) {
    var d = this._computeSeekSearchTime(this.seekTargetTime), e = a.currentTime;
    this.requestKeyframe ? (a.currentTime = d, this._logDebug("setVideoStartTime: requestKeyframe, video.currentTime was " + e + ", video.currentTime -> searchStart = " + d)) : a.currentTime > this.seekTargetTime ? (a.currentTime = this.seekTargetTime, this._logDebug("setVideoStartTime: back up to seekTargetTime = " + this.seekTargetTime + ", video.currentTime was " + e)) : this._logDebug("setVideoStartTime: don't touch video.currentTime, was " +
      e);
    a.muted || (this.unmuteAfterSeek = a.muted = !0)
  } else a.currentTime = 0
};

HoloVideoObject.prototype._loadNextVideo = function () {
  var a = this;
  if (0 != this.freeVideoElements.length) {
    var d = this.freeVideoElements.shift(), e = this.videoElements[d];
    e.videoElementIndex = d;
    d = this.nextVideoLoadIndex;
    var b = this.json.extensions[HoloVideoObject._extName].timeline.length;
    this.nextVideoLoadIndex = (this.nextVideoLoadIndex + 1) % b;
    d = this.json.images[this.json.extensions[HoloVideoObject._extName].timeline[d].image];
    d.video = e;
    e.preloaded = !1;
    e.autoplay = !1;
    e.muted = this.openOptions.autoplay || !this.openOptions.audioEnabled;
    this.isSafari && (e.muted = !0);
    e.loop = 1 == b && this.openOptions.autoloop;
    e.preload = "auto";
    e.crossOrigin = "use-credentials";
    e.playing = !1;
    e.preloaded = !1;
    e.src = null;
    b = d.extensions[HoloVideoObject._extName];
    void 0 === this.openOptions.streamMode && (this.openOptions.streamMode = HoloVideoObject.StreamMode.Automatic);
    var g = this.iOSVersion && 14 == this.iOSVersion.major && 6 > this.iOSVersion.minor;
    !this.iOSVersion && 15 > this.safariVersion.major && (g = !0);
    this.openOptions.streamMode == HoloVideoObject.StreamMode.HLS || this.openOptions.streamMode ==
      HoloVideoObject.StreamMode.Automatic && (this.isSafari || this.isMozillaWebXRViewer) && b.hlsUri && !g ? (this._setVideoStartTime(e), e.src = this.urlRoot + b.hlsUri, e.mp4Name = b.hlsUri) : this.openOptions.streamMode == HoloVideoObject.StreamMode.Dash || this.openOptions.streamMode == HoloVideoObject.StreamMode.Automatic && !this.isSafari && !this.isMozillaWebXRViewer && b.dashUri && "undefined" != typeof dashjs ? (this.dashPlayer || (this.dashPlayer = dashjs.MediaPlayer().create(), this.dashPlayer.initialize()), g = this.urlRoot + b.dashUri,
        this.seekTargetTime ? (d = this._computeSeekSearchTime(this.seekTargetTime), g += "#t=" + d, this.dashPlayer.attachView(e), this.dashPlayer.attachSource(g), e.currentTime = d, e.muted || (this.unmuteAfterSeek = e.muted = !0)) : (this.dashPlayer.attachView(e), this.dashPlayer.attachSource(g)), e.mp4Name = b.dashUri) : (this._setVideoStartTime(e), g = this.urlRoot + d.uri, e.src = g, e.mp4Name = d.uri);
    this._logInfo("loading video " + e.mp4Name);
    var l = this;
    e.addEventListener("canplay", function () { l.videoState = HoloVideoObject.VideoStates.CanPlay });
    e.addEventListener("play", function () { l.videoState = HoloVideoObject.VideoStates.Playing });
    e.addEventListener("canplaythrough", function () { l.videoState = HoloVideoObject.VideoStates.CanPlayThrough });
    e.addEventListener("waiting", function () { l.videoState = HoloVideoObject.VideoStates.Waiting });
    e.addEventListener("suspend", function () { l.videoState = HoloVideoObject.VideoStates.Suspended });
    e.addEventListener("stalled", function () { l.videoState = HoloVideoObject.VideoStates.Stalled });
    e.canplay = function () {
      a._logInfo("video -> canplay");
      a.videoState = HoloVideoObject.VideoStates.CanPlay
    };
    e.canplaythrough = function () {
      a._logInfo("video -> canplaythrough");
      a.videoState = HoloVideoObject.VideoStates.CanPlayThrough
    };
    e.waiting = function () {
      a._logInfo("video -> waiting");
      a.videoState = HoloVideoObject.VideoStates.Waiting
    };
    e.suspend = function () {
      a._logInfo("video -> suspend");
      a.videoState = HoloVideoObject.VideoStates.Suspended
    };
    e.stalled = function () {
      a._logInfo("video -> stalled");
      a.videoState = HoloVideoObject.VideoStates.Stalled
    };
    e.onerror = function (b) {
      a._logError("video error: " +
        b.target.error.code + " - " + b.target.mp4Name);
      a._onError(HoloVideoObject.ErrorStates.VideoError, b.target.error)
    };
    e.onended = function () {
      a.pendingVideoEndEvent = !0;
      a.pendingVideoEndEventWaitCount = 0
    };
    this.isSafari ? e.onplaying = function () {
      e.pause();
      e.muted = this.openOptions.autoplay || !this.openOptions.audioEnabled;
      e.preloaded = !0;
      this._logInfo("video loaded: " + e.mp4Name);
      e.onplaying = function () {
        this._logInfo("video playing: " + e.mp4Name);
        e.playing = !0
      }.bind(this);
      ++this.videosLoaded;
      this._startPlaybackIfReady();
      this._loadNextVideo()
    }.bind(this) : (e.onloadeddata = function () {
      var a = e.play();
      void 0 !== a && a.then(function (a) { }).catch(function (a) { e.onplaying() })
    }.bind(this), e.onplaying = function () {
      e.pause();
      e.preloaded = !0;
      this._logInfo("video loaded: " + e.mp4Name);
      e.onplaying = function () {
        this._logInfo("video playing: " + e.mp4Name);
        e.playing = !0
      }.bind(this);
      ++this.videosLoaded;
      this._startPlaybackIfReady();
      this._loadNextVideo()
    }.bind(this));
    this.isSafari && (d = e.play(), void 0 !== d && d.catch(function (b) {
      a._logWarning("play prevented: " +
        b);
      a._onError(HoloVideoObject.ErrorStates.PlaybackPrevented, b)
    }))
  }
};

HoloVideoObject.prototype._resetFreeBuffers = function () {
  this.freeArrayBuffers = [];
  for (var a = 0;
    a < Math.min(this.openOptions.maxBuffers, this.json.buffers.length - 1);
    ++a)this.freeArrayBuffers.push(a)
};

HoloVideoObject.prototype.rewind = function () {
  if (this.json) {
    this._logInfo("rewind");
    var a = this._currentVideo();
    a.pause();
    a.playing = !1;
    a.currentTime = 0;
    this.pendingVideoEndEvent = !1;
    this.state = HoloVideoObject.States.Opening;
    this.openOptions.keepAllMeshesInMemory || this._resetFreeBuffers();
    this.currentBufferIndex = 0;
    this.nextBufferLoadIndex = this.fallbackFrameBuffer ? 1 : 0;
    this.lastKeyframe = this.frameIndex = -1;
    this.lastKeyframeUVs = this.lastKeyframeIndices = null;
    this.nextPbo = 0;
    this.lastVideoSampleIndex = -1;
    this.filledFallbackFrame =
      !1;
    this.prevPrevMesh = this.prevMesh = this.curMesh = null;
    delete this.seekTargetTime;
    if (this.readFences) for (a = 0;
      a < this.readFences.length;
      ++a)this.readFences[a] && (this.gl.deleteSync(this.readFences[a]), this.readFences[a] = null);
    this._loadNextBuffer();
    this._loadFallbackFrame();
    this._startPlaybackIfReady()
  }
};

HoloVideoObject.prototype.forceLoad = function () {
  var a = this;
  if (this.json) {
    var d = this._currentVideo();
    d.playing ? this._logInfo("forceLoad: video already playing") : d.preloaded || (this._logInfo("forceLoad: manually starting video"), this.suspended = !0, d = d.play(), void 0 !== d && d.then(function (d) { a.state = HoloVideoObject.States.Playing }).catch(function (d) {
      a._logWarning("play prevented: " + d);
      a._onError(HoloVideoObject.ErrorStates.PlaybackPrevented, d)
    }))
  } else this._logInfo("forceLoad: don't have json yet")
};

HoloVideoObject.prototype._onVideoEnded = function (a) {
  this._logInfo("video ended = " + a.mp4Name);
  this.freeVideoElements.push(a.videoElementIndex);
  a.videoElementIndex = -1;
  a = this.json.extensions[HoloVideoObject._extName].timeline;
  this.state = HoloVideoObject.States.Opened;
  if (this.currentVideoIndex != a.length - 1 || this.openOptions.autoloop) this.currentVideoIndex = (this.currentVideoIndex + 1) % a.length, this._loadNextVideo(), this._startPlaybackIfReady();
  else if (this.eos = !0, this.onEndOfStream) this.onEndOfStream(this)
};

HoloVideoObject.prototype._setupTransformFeedback = function () {
  var a = this.gl;
  this.outputBufferIndex = 0;
  this.deltasBuf = a.createBuffer();
  this.outputBuffers = [a.createBuffer(), a.createBuffer(), a.createBuffer()];
  this.transformFeedbacks = [a.createTransformFeedback(), a.createTransformFeedback(), a.createTransformFeedback()];
  this.vaos = [a.createVertexArray(), a.createVertexArray(), a.createVertexArray()];
  a.bindVertexArray(null);
  for (var d = 0;
    3 > d;
    ++d)a.bindTransformFeedback(a.TRANSFORM_FEEDBACK, this.transformFeedbacks[d]),
      a.bindBufferBase(a.TRANSFORM_FEEDBACK_BUFFER, 0, this.outputBuffers[d]);
  this.normalsVao = a.createVertexArray();
  this.normalsTF = a.createTransformFeedback();
  a.bindTransformFeedback(a.TRANSFORM_FEEDBACK, null);
  a.bindBuffer(a.TRANSFORM_FEEDBACK_BUFFER, null);
  d = this._createProgram(a, "#version 300 es\n            in vec3 inQuantized;\n            in vec3 prevPos;\n            in vec3 prevPrevPos;\n\n            uniform vec3 decodeMin;\n            uniform vec3 decodeMax;\n            uniform int havePrevPos;\n            uniform int havePrevPrevPos;\n\n            out vec3 outPos;\n\n            void main()\n            {\n                if (havePrevPos == 1)\n                {\n                    vec3 dm = vec3(0.0, 0.0, 0.0);\n\n                    if (havePrevPrevPos == 1)\n                    {\n                        dm = prevPos - prevPrevPos;\n                    }\n\n                    vec3 delta = (decodeMax - decodeMin) * inQuantized + decodeMin;\n                    outPos = prevPos + dm + delta;\n                }\n\n                else\n                {\n                    outPos = (decodeMax - decodeMin) * inQuantized + decodeMin;\n                }\n            }",
    "#version 300 es\n            out lowp vec4 fragColor;\n            void main()\n            {\n                fragColor = vec4(0,0,0,0);\n            }\n            ", function (d) { a.transformFeedbackVaryings(d, ["outPos"], a.SEPARATE_ATTRIBS) });
  d.havePrevPosLoc = a.getUniformLocation(d, "havePrevPos");
  d.havePrevPrevPosLoc = a.getUniformLocation(d, "havePrevPrevPos");
  d.decodeMinLoc = a.getUniformLocation(d, "decodeMin");
  d.decodeMaxLoc = a.getUniformLocation(d, "decodeMax");
  d.inQuantizedLoc = a.getAttribLocation(d,
    "inQuantized");
  d.prevPosLoc = a.getAttribLocation(d, "prevPos");
  d.prevPrevPosLoc = a.getAttribLocation(d, "prevPrevPos");
  this.tfShader = d;
  d = this._createProgram(a, "#version 300 es\n            in vec2 inOctNormal;\n            out vec3 outNormal;\n\n            vec3 OctDecode(vec2 f)\n            {\n                f = f * 2.0 - 1.0;\n\n                // https://twitter.com/Stubbesaurus/status/937994790553227264\n                vec3 n = vec3( f.x, f.y, 1.0 - abs(f.x) - abs(f.y));\n                float t = clamp(-n.z, 0.0, 1.0);\n                n.x += n.x >= 0.0 ? -t : t;\n                n.y += n.y >= 0.0 ? -t : t;\n                return normalize(n);\n            }\n\n            void main()\n            {\n                outNormal = OctDecode(inOctNormal);\n            }",
    "#version 300 es\n            out lowp vec4 fragColor;\n            void main()\n            {\n                fragColor = vec4(0,0,0,0);\n            }\n            ", function (d) { a.transformFeedbackVaryings(d, ["outNormal"], a.SEPARATE_ATTRIBS) });
  d.inOctNormalLoc = a.getAttribLocation(d, "inOctNormal");
  this.octNormalsShader = d
};

HoloVideoObject.prototype._updateMeshTF = function (a, d, e, b, g, l, f, m) {
  var c = this.gl;
  a.outputBuffer = this.outputBuffers[this.outputBufferIndex];
  var p = c.getParameter(c.ARRAY_BUFFER_BINDING), r = c.getParameter(c.ELEMENT_ARRAY_BUFFER_BINDING), n = c.getParameter(c.CURRENT_PROGRAM), h = c.getParameter(c.VERTEX_ARRAY_BINDING);
  c.useProgram(this.tfShader);
  c.bindBuffer(c.ARRAY_BUFFER, null);
  var k = this.tfShader;
  if (a.primitives[0].extensions[HoloVideoObject._extName].attributes.POSITION) {
    this.lastKeyframe = this.frameIndex;
    f && (c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, b), c.bufferData(c.ELEMENT_ARRAY_BUFFER, l.indices, c.STATIC_DRAW), c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, r), c.bindBuffer(c.ARRAY_BUFFER, e), c.bufferData(c.ARRAY_BUFFER, l.compressedUVs, c.STATIC_DRAW));
    c.bindVertexArray(this.vaos[0]);
    this.prevPrevMesh = this.prevMesh = null;
    var t = a.compressedPos.count;
    a.indexCount = a.indices.count;
    c.bindBuffer(c.ARRAY_BUFFER, this.deltasBuf);
    c.bufferData(c.ARRAY_BUFFER, l.compressedPos, c.DYNAMIC_DRAW);
    c.enableVertexAttribArray(k.inQuantizedLoc);
    c.vertexAttribPointer(k.inQuantizedLoc, 3, a.compressedPos.componentType, !0, 0, 0);
    c.disableVertexAttribArray(k.prevPosLoc);
    c.disableVertexAttribArray(k.prevPrevPosLoc);
    var q = a.compressedPos.extensions[HoloVideoObject._extName].decodeMin, v = a.compressedPos.extensions[HoloVideoObject._extName].decodeMax;
    c.uniform3fv(k.decodeMinLoc, q);
    c.uniform3fv(k.decodeMaxLoc, v);
    this.currentFrameInfo.bboxMin = q;
    this.currentFrameInfo.bboxMax = v;
    c.uniform1i(k.havePrevPosLoc, 0);
    c.uniform1i(k.havePrevPrevPosLoc, 0)
  } else t = a.deltas.count,
    a.indexCount = this.prevMesh.indexCount, null == this.prevPrevMesh ? c.bindVertexArray(this.vaos[1]) : c.bindVertexArray(this.vaos[2]), c.bindBuffer(c.ARRAY_BUFFER, this.deltasBuf), c.bufferData(c.ARRAY_BUFFER, l.deltas, c.DYNAMIC_DRAW), c.enableVertexAttribArray(k.inQuantizedLoc), c.vertexAttribPointer(k.inQuantizedLoc, 3, a.deltas.componentType, !0, 0, 0), c.uniform3fv(k.decodeMinLoc, a.deltas.extensions[HoloVideoObject._extName].decodeMin), c.uniform3fv(k.decodeMaxLoc, a.deltas.extensions[HoloVideoObject._extName].decodeMax),
    c.uniform1i(k.havePrevPosLoc, 1), c.bindBuffer(c.ARRAY_BUFFER, this.prevMesh.outputBuffer), c.enableVertexAttribArray(k.prevPosLoc), c.vertexAttribPointer(k.prevPosLoc, 3, c.FLOAT, !1, 0, 0), null == this.prevPrevMesh ? (c.uniform1i(k.havePrevPrevPosLoc, 0), c.disableVertexAttribArray(k.prevPrevPosLoc)) : (c.uniform1i(k.havePrevPrevPosLoc, 1), c.bindBuffer(c.ARRAY_BUFFER, this.prevPrevMesh.outputBuffer), c.enableVertexAttribArray(k.prevPrevPosLoc), c.vertexAttribPointer(k.prevPrevPosLoc, 3, c.FLOAT, !1, 0, 0));
  k = 12 * t;
  c.bindBuffer(c.ARRAY_BUFFER,
    a.outputBuffer);
  c.bindBuffer(c.ARRAY_BUFFER, null);
  c.bindTransformFeedback(c.TRANSFORM_FEEDBACK, this.transformFeedbacks[this.outputBufferIndex]);
  c.enable(c.RASTERIZER_DISCARD);
  c.beginTransformFeedback(c.POINTS);
  c.drawArrays(c.POINTS, 0, t);
  c.endTransformFeedback();
  c.disable(c.RASTERIZER_DISCARD);
  c.bindTransformFeedback(c.TRANSFORM_FEEDBACK, null);
  c.bindBuffer(c.TRANSFORM_FEEDBACK_BUFFER, null);
  f && (c.bindBuffer(c.COPY_READ_BUFFER, a.outputBuffer), c.bindBuffer(c.COPY_WRITE_BUFFER, d), c.bufferData(c.COPY_WRITE_BUFFER,
    k, c.DYNAMIC_COPY), c.copyBufferSubData(c.COPY_READ_BUFFER, c.COPY_WRITE_BUFFER, 0, 0, k), c.bindBuffer(c.COPY_READ_BUFFER, null), c.bindBuffer(c.COPY_WRITE_BUFFER, null), m && (c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, b), c.bufferData(c.ELEMENT_ARRAY_BUFFER, this.lastKeyframeIndices, c.DYNAMIC_DRAW), c.bindBuffer(c.ARRAY_BUFFER, e), c.bufferData(c.ARRAY_BUFFER, this.lastKeyframeUVs, c.DYNAMIC_DRAW)));
  this.outputBufferIndex = (this.outputBufferIndex + 1) % 3;
  g && l.compressedNormals && f && (this.fileInfo.octEncodedNormals ? (c.useProgram(this.octNormalsShader),
    c.bindBuffer(c.ARRAY_BUFFER, null), c.bindVertexArray(this.normalsVao), c.bindBuffer(c.ARRAY_BUFFER, this.deltasBuf), c.bufferData(c.ARRAY_BUFFER, l.compressedNormals, c.DYNAMIC_DRAW), c.enableVertexAttribArray(this.octNormalsShader.inOctNormalLoc), c.vertexAttribPointer(this.octNormalsShader.inOctNormalLoc, 2, c.UNSIGNED_BYTE, !0, 0, 0), k = 12 * t, c.bindBuffer(c.ARRAY_BUFFER, g), c.bufferData(c.ARRAY_BUFFER, k, c.DYNAMIC_DRAW), c.bindBuffer(c.ARRAY_BUFFER, null), c.bindTransformFeedback(c.TRANSFORM_FEEDBACK, this.normalsTF),
    c.bindBufferBase(c.TRANSFORM_FEEDBACK_BUFFER, 0, g), c.enable(c.RASTERIZER_DISCARD), c.beginTransformFeedback(c.POINTS), c.drawArrays(c.POINTS, 0, t), c.endTransformFeedback(), c.disable(c.RASTERIZER_DISCARD), c.bindTransformFeedback(c.TRANSFORM_FEEDBACK, null), c.bindBuffer(c.TRANSFORM_FEEDBACK_BUFFER, null)) : (c.bindBuffer(c.ARRAY_BUFFER, g), c.bufferData(c.ARRAY_BUFFER, l.compressedNormals, c.DYNAMIC_DRAW)));
  c.useProgram(n);
  c.bindBuffer(c.ARRAY_BUFFER, p);
  c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, r);
  c.bindVertexArray(h);
  return !0
};

HoloVideoObject.prototype._updateMesh = function (a, d, e, b, g, l) {
  this.frameIndex = (this.frameIndex + 1) % this.meshFrames.length;
  var f = this.meshFrames[this.frameIndex];
  if (!f.ensureBuffers()) return !1;
  this.prevPrevMesh && (this.prevPrevMesh.uncompressedPos = null);
  this.prevPrevMesh = this.prevMesh;
  this.prevMesh = this.curMesh;
  this.curMesh = f;
  var m = { indices: null, compressedPos: null, compressedUVs: null, compressedNormals: null, deltas: null }, c = this.gl, p = this.json.buffers, r = this.json.bufferViews;
  if (f.primitives[0].extensions[HoloVideoObject._extName].attributes.POSITION) {
    var n = p[r[f.indices.bufferView].buffer].arrayBufferIndex;
    var h = this.buffers[n], k = this.buffers[n], t = this.buffers[n];
    m.indices = f.indices.componentType == c.UNSIGNED_SHORT ? new Uint16Array(h, r[f.indices.bufferView].byteOffset + f.indices.byteOffset, f.indices.count) : new Uint32Array(h, r[f.indices.bufferView].byteOffset + f.indices.byteOffset, f.indices.count);
    this.lastKeyframeIndices = m.indices;
    m.compressedPos = new Uint16Array(k, r[f.compressedPos.bufferView].byteOffset + f.compressedPos.byteOffset, 3 * f.compressedPos.count);
    this.lastKeyframeUVs = m.compressedUVs = new Uint16Array(t,
      r[f.compressedUVs.bufferView].byteOffset + f.compressedUVs.byteOffset, 2 * f.compressedUVs.count)
  } else n = p[r[f.deltas.bufferView].buffer].arrayBufferIndex, m.deltas = new Uint8Array(this.buffers[n], r[f.deltas.bufferView].byteOffset + f.deltas.byteOffset, 3 * f.deltas.count);
  n != this.currentBufferIndex && (-1 == this.currentBufferIndex ? this.currentBufferIndex = n : (this._logInfo("currentBufferIndex -> " + n), this.openOptions.keepAllMeshesInMemory || this.freeArrayBuffers.push(this.currentBufferIndex), this.currentBufferIndex =
    n, this.pendingBufferDownload || this._loadNextBuffer()));
  null != f.compressedNormals && (p = this.buffers[p[r[f.compressedNormals.bufferView].buffer].arrayBufferIndex], "VEC2" == f.compressedNormals.type ? m.compressedNormals = new Uint8Array(p, r[f.compressedNormals.bufferView].byteOffset + f.compressedNormals.byteOffset, 2 * f.compressedNormals.count) : "VEC3" == f.compressedNormals.type && (m.compressedNormals = new Uint16Array(p, r[f.compressedNormals.bufferView].byteOffset + f.compressedNormals.byteOffset, 3 * f.compressedNormals.count)));
  if (this.caps.webgl2 && !this.caps.badTF) return this._updateMeshTF(f, a, d, e, b, m, g, l);
  r = c.getParameter(c.ARRAY_BUFFER_BINDING);
  p = c.getParameter(c.ELEMENT_ARRAY_BUFFER_BINDING);
  if (f.primitives[0].extensions[HoloVideoObject._extName].attributes.POSITION) {
    this.lastKeyframe = this.frameIndex;
    this.prevMesh && (this.prevMesh = this.prevMesh.uncompressedPos = null);
    this.prevPrevMesh && (this.prevPrevMesh = this.prevPrevMesh.uncompressedPos = null);
    g && (c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, e), c.bufferData(c.ELEMENT_ARRAY_BUFFER,
      m.indices, c.DYNAMIC_DRAW));
    f.indexCount = f.indices.count;
    n = f.compressedPos.count;
    f.uncompressedPos = new Float32Array(3 * n);
    var q = f.compressedPos.extensions[HoloVideoObject._extName].decodeMin;
    h = f.compressedPos.extensions[HoloVideoObject._extName].decodeMax;
    this.currentFrameInfo.bboxMin = q;
    this.currentFrameInfo.bboxMax = h;
    var v = (h[0] - q[0]) / 65535, z = (h[1] - q[1]) / 65535, w = (h[2] - q[2]) / 65535;
    for (h = 0;
      h < n;
      ++h) {
      var u = 3 * h, x = u + 1, y = u + 2;
      f.uncompressedPos[u] = m.compressedPos[u] * v + q[0];
      f.uncompressedPos[x] = m.compressedPos[x] *
        z + q[1];
      f.uncompressedPos[y] = m.compressedPos[y] * w + q[2]
    } g && (c.bindBuffer(c.ARRAY_BUFFER, a), c.bufferData(c.ARRAY_BUFFER, f.uncompressedPos, c.DYNAMIC_DRAW));
    g && (c.bindBuffer(c.ARRAY_BUFFER, d), c.bufferData(c.ARRAY_BUFFER, m.compressedUVs, c.DYNAMIC_DRAW))
  } else {
    n = f.deltas.count;
    f.uncompressedPos = new Float32Array(3 * n);
    f.indexCount = this.prevMesh.indexCount;
    q = f.deltas.extensions[HoloVideoObject._extName].decodeMin;
    h = f.deltas.extensions[HoloVideoObject._extName].decodeMax;
    v = (h[0] - q[0]) / 255;
    z = (h[1] - q[1]) / 255;
    w =
      (h[2] - q[2]) / 255;
    var B = m.deltas;
    if (null == this.prevPrevMesh) for (h = 0;
      h < n;
      ++h) {
      u = 3 * h;
      x = u + 1;
      y = u + 2;
      k = this.prevMesh.uncompressedPos[u];
      t = this.prevMesh.uncompressedPos[x];
      var A = this.prevMesh.uncompressedPos[y], C = B[u] * v + q[0], D = B[x] * z + q[1], E = B[y] * w + q[2];
      k += C;
      t += D;
      A += E;
      f.uncompressedPos[u] = k;
      f.uncompressedPos[x] = t;
      f.uncompressedPos[y] = A
    } else for (h = 0;
      h < n;
      ++h)u = 3 * h, x = u + 1, y = u + 2, k = this.prevMesh.uncompressedPos[u], t = this.prevMesh.uncompressedPos[x], A = this.prevMesh.uncompressedPos[y], C = t - this.prevPrevMesh.uncompressedPos[x],
        D = A - this.prevPrevMesh.uncompressedPos[y], k += k - this.prevPrevMesh.uncompressedPos[u], t += C, A += D, C = B[u] * v + q[0], D = B[x] * z + q[1], E = B[y] * w + q[2], k += C, t += D, A += E, f.uncompressedPos[u] = k, f.uncompressedPos[x] = t, f.uncompressedPos[y] = A;
    g && (l && (c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, e), c.bufferData(c.ELEMENT_ARRAY_BUFFER, this.lastKeyframeIndices, c.DYNAMIC_DRAW), c.bindBuffer(c.ARRAY_BUFFER, d), c.bufferData(c.ARRAY_BUFFER, this.lastKeyframeUVs, c.DYNAMIC_DRAW)), c.bindBuffer(c.ARRAY_BUFFER, a), c.bufferData(c.ARRAY_BUFFER, f.uncompressedPos,
      c.DYNAMIC_DRAW))
  } if (b && m.compressedNormals && g) if (this.fileInfo.octEncodedNormals) {
    n = m.compressedNormals.length;
    a = new Float32Array(3 * n);
    d = Math.abs;
    e = this._clamp;
    for (h = 0;
      h < n;
      ++h)k = m.compressedNormals[2 * h], t = m.compressedNormals[2 * h + 1], k = -1 + .0078125 * k, t = -1 + .0078125 * t, A = 1 - d(k) - d(t), g = e(-A, 0, 1), k += 0 <= k ? -g : g, t += 0 <= t ? -g : g, g = 1 / Math.sqrt(k * k + t * t + A * A), a[3 * h] = k * g, a[3 * h + 1] = t * g, a[3 * h + 2] = A * g;
    c.bindBuffer(c.ARRAY_BUFFER, b);
    c.bufferData(c.ARRAY_BUFFER, a, c.DYNAMIC_DRAW)
  } else c.bindBuffer(c.ARRAY_BUFFER, b), c.bufferData(c.ARRAY_BUFFER,
    m.compressedNormals, c.DYNAMIC_DRAW);
  c.bindBuffer(c.ARRAY_BUFFER, r);
  c.bindBuffer(c.ELEMENT_ARRAY_BUFFER, p);
  return !0
};

HoloVideoObject.prototype._clamp = function (a, d, e) { return a < d ? d : a > e ? e : a };

HoloVideoObject.prototype._setupMeshFrames = function () {
  for (var a = this.json, d = a.accessors, e = a.meshes.length, b = this.buffers, g = this, l = function () {
    var c = a.bufferViews, d = a.buffers;
    if (this.primitives[0].extensions[HoloVideoObject._extName].attributes.POSITION) {
      var e = c[this.indices.bufferView];
      if (void 0 == d[e.buffer].arrayBufferIndex || b[d[e.buffer].arrayBufferIndex].bufferIndex != e.buffer) return g._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + d[e.buffer].uri), !1;
      e = c[this.compressedPos.bufferView];
      if (void 0 == d[e.buffer].arrayBufferIndex || b[d[e.buffer].arrayBufferIndex].bufferIndex != e.buffer) return g._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + d[e.buffer].uri), !1;
      e = c[this.compressedUVs.bufferView];
      if (void 0 == d[e.buffer].arrayBufferIndex || b[d[e.buffer].arrayBufferIndex].bufferIndex != e.buffer) return g._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + d[e.buffer].uri), !1
    } else if (e = c[this.deltas.bufferView], void 0 == d[e.buffer].arrayBufferIndex || b[d[e.buffer].arrayBufferIndex].bufferIndex !=
      e.buffer) return g._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + d[e.buffer].uri), !1;
    return this.compressedNormals && (c = c[this.compressedNormals.bufferView], void 0 == d[c.buffer].arrayBufferIndex || b[d[c.buffer].arrayBufferIndex].bufferIndex != c.buffer) ? (g._logInfo("buffer for frame " + this.frameIndex + " not downloaded yet: " + d[c.buffer].uri), !1) : !0
  }, f = 0;
    f < e;
    ++f) {
    var m = this.json.meshes[f];
    m.frameIndex = f;
    m.ensureBuffers = l;
    var c = m.primitives[0].extensions[HoloVideoObject._extName].attributes;
    c.POSITION ? (m.indices = d[m.primitives[0].extensions[HoloVideoObject._extName].indices], m.compressedUVs = d[c.TEXCOORD_0], m.compressedPos = d[c.POSITION]) : m.deltas = d[c._DELTA];
    null != c.NORMAL && (this.fileInfo.haveNormals = !0, m.compressedNormals = d[c.NORMAL], "VEC2" == m.compressedNormals.type && (this.fileInfo.octEncodedNormals = !0));
    this.meshFrames.push(m)
  }
};

HoloVideoObject.prototype._onJsonLoaded = function (a) {
  this._logInfo(this.capsStr);
  this._logInfo("got json");
  this.json = JSON.parse(a);
  this.openOptions.keepAllMeshesInMemory && (this.openOptions.maxBuffers = this.json.buffers.length - 1);
  this.minBuffers = Math.min(this.openOptions.minBuffers, this.json.buffers.length - 1);
  this.minVideos = Math.min(2, this.json.extensions[HoloVideoObject._extName].timeline.length);
  this.buffers = [null, null, null];
  0 == this.videoElements.length && (this.videoElements = [document.createElement("video")]);
  this.videoElements[0].setAttribute("playsinline", "playsinline");
  this.videoElements[0].volume = this.audioVolume;
  this.freeVideoElements.push(0);
  for (a = 0;
    a < Math.min(this.openOptions.maxBuffers, this.json.buffers.length - 1);
    ++a)this.freeArrayBuffers.push(a);
  this.openOptions.startTime && (this._setSeekTarget(this.openOptions.startTime), this.pauseAfterSeek = this.seekingAutoPlay = !0);
  this._setupMeshFrames();
  this._loadNextVideo();
  this.seekTargetTime && (this.seekingStartBufferIndex = this.json.bufferViews[this.meshFrames[this.searchStartFrame].indices.bufferView].buffer);
  this._loadNextBuffer();
  this.currentBufferIndex = 0;
  a = this.json.images[1].extensions[HoloVideoObject._extName];
  this.fileInfo.videoWidth = a.width;
  this.fileInfo.videoHeight = a.height;
  var d = this.json.extensions[HoloVideoObject._extName];
  this.fileInfo.maxVertexCount = d.maxVertexCount;
  this.fileInfo.maxIndexCount = d.maxIndexCount;
  this.fileInfo.boundingBox = { min: d.boundingMin, max: d.boundingMax };
  if (this.onLoaded) this.onLoaded(this.fileInfo);
  if (this.outputBuffers) {
    var e = this.gl, b = e.getParameter(e.ARRAY_BUFFER_BINDING);
    for (a = 0;
      3 > a;
      ++a)e.bindBuffer(e.ARRAY_BUFFER, this.outputBuffers[a]), e.bufferData(e.ARRAY_BUFFER, 12 * d.maxVertexCount, e.STREAM_COPY);
    e.bindBuffer(e.ARRAY_BUFFER, b)
  }
};

HoloVideoObject.prototype._getChromeVersion = function () {
  var a = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return a ? parseInt(a[2], 10) : !1
};

HoloVideoObject.prototype._getIOSVersion = function () {
  var a = window.navigator.userAgent;
  if (0 < a.indexOf("iPhone") || 0 < a.indexOf("iPad") || 0 < a.indexOf("iPod")) if (a = a.match(/OS (\d+)_(\d+)_?(\d+)?/)) return { major: parseInt(a[1] || 0, 10), minor: parseInt(a[2] || 0, 10), patch: parseInt(a[3] || 0, 10) };
  return !1
};

HoloVideoObject.prototype._getSafariVersion = function () {
  var a = window.navigator.userAgent.match(/Version\/(\d+).(\d+).?(\d+)?/);
  return a ? { major: parseInt(a[1] || 0, 10), minor: parseInt(a[2] || 0, 10), patch: parseInt(a[3] || 0, 10) } : !1
};

HoloVideoObject.prototype._logDebug = function (a, d) { 3 <= this.logLevel && console.log("[" + this.id + "] " + a) };

HoloVideoObject.prototype._logInfo = function (a, d) { (2 <= this.logLevel || d) && console.log("[" + this.id + "] " + a) };

HoloVideoObject.prototype._logWarning = function (a) { 1 <= this.logLevel && console.log("[" + this.id + "] " + a) };

HoloVideoObject.prototype._logError = function (a) { 0 <= this.logLevel && console.log("[" + this.id + "] " + a) };

HoloVideoObject.prototype._onError = function (a, d) { this.errorCallback && this.errorCallback(a, d) };

HoloVideoObject.prototype._initializeWebGLResources = function (a) {
  var d = {}, e = a.getParameter(a.VERSION);
  d.webgl2 = -1 != e.indexOf("WebGL 2.");
  d.badTF = !1;
  this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  this.safariVersion = this._getSafariVersion();
  this.isMozillaWebXRViewer = (this.iOSVersion = this._getIOSVersion()) && navigator.userAgent.includes("WebXRViewer");
  navigator.userAgent.includes("Mobile") && "iPhone" != navigator.platform && "iPad" != navigator.platform && "iPod" != navigator.platform &&
    (this.isSafari = !1);
  if (this.isSafari || this.isMozillaWebXRViewer) d.webgl2 = !1;
  if (e = a.getExtension("WEBGL_debug_renderer_info")) d.vendor = a.getParameter(e.UNMASKED_VENDOR_WEBGL), d.renderer = a.getParameter(e.UNMASKED_RENDERER_WEBGL), d.isSafari = this.isSafari, d.iOSVersion = this.iOSVersion, -1 != d.renderer.indexOf("Mali") && (d.badTF = !0);
  this.capsStr = JSON.stringify(d, null, 4);
  this.caps = d;
  this.fbo1 = a.createFramebuffer();
  this.caps.webgl2 ? (this.caps.supports32BitIndices = !0, this.caps.badTF || this._setupTransformFeedback(),
    this.createOptions.disableAsyncDecode ? this.textures = [null] : (this.fbo2 = a.createFramebuffer(), this.textures = Array(this.createOptions.numAsyncFrames), this.pixelBuffers = Array(this.createOptions.numAsyncFrames), this.readFences = Array(this.createOptions.numAsyncFrames), this.nextPbo = 0)) : (this.caps.supports32BitIndices = null != a.getExtension("OES_element_index_uint"), this.caps.supports32BitIndices || this._logWarning("WebGL1: extension 'OES_element_index_uint' not supported, captures w/32-bit index data will not be playable"),
      this.textures = [null], this.fbo2 = a.createFramebuffer(), d = this._createProgram(a, "#version 100\n            attribute mediump vec2 pos;\n            varying mediump vec2 uv;\n            void main()\n            {\n                uv = (0.5 * pos + vec2(0.5, 0.5));\n                gl_Position = vec4(pos, 0.0, 1.0);\n            }\n            ", "#version 100\n            uniform lowp sampler2D textureSampler;\n            varying mediump vec2 uv;\n            void main()\n            {\n                gl_FragColor = texture2D(textureSampler, uv);\n                //gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\n            }\n            ",
        function (b) { a.bindAttribLocation(b, 0, "pos") }), d.vertexAttribLoc = 0, d.textureSamplerLoc = a.getUniformLocation(d, "textureSampler"), this.texCopyShader = d, this.texCopyShader.vertexAttribLoc = 0, this.texCopyVerts = a.createBuffer(), a.bindBuffer(a.ARRAY_BUFFER, this.texCopyVerts), a.bufferData(a.ARRAY_BUFFER, new Float32Array([-1, 3, 3, -1, -1, -1]), a.STATIC_DRAW), a.bindBuffer(a.ARRAY_BUFFER, null));
  d = a.getParameter(a.TEXTURE_BINDING_2D);
  for (e = 0;
    e < this.textures.length;
    ++e)this.textures[e] = a.createTexture(), a.bindTexture(a.TEXTURE_2D,
      this.textures[e]), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
  a.bindTexture(a.TEXTURE_2D, d)
};

HoloVideoObject.prototype._releaseWebGLResources = function (a) {
  if (this.caps.webgl2 && !this.caps.badTF) {
    a.deleteBuffer(this.deltasBuf);
    for (var d = 0;
      3 > d;
      ++d)a.deleteBuffer(this.outputBuffers[d]), this.outputBuffers[d] = null, a.deleteTransformFeedback(this.transformFeedbacks[d]), this.transformFeedbacks[d] = null, a.deleteVertexArray(this.vaos[d]), this.vaos[d] = null;
    a.deleteTransformFeedback(this.normalsTF);
    this.normalsTF = null;
    a.deleteVertexArray(this.normalsVao);
    this.normalsVao = null;
    a.deleteProgram(this.tfShader);
    this.tfShader = null;
    a.deleteProgram(this.octNormalsShader);
    this.octNormalsShader = null
  } this.texCopyShader && (a.deleteProgram(this.texCopyShader), this.texCopyShader = null);
  this.texCopyVerts && (a.deleteBuffer(this.texCopyVerts), this.texCopyVerts = null);
  if (this.pixelBuffers) for (d = 0;
    d < this.pixelBuffers.length;
    ++d)a.deleteBuffer(this.pixelBuffers[d]), this.pixelBuffers[d] = null;
  if (this.readFences) for (d = 0;
    d < this.readFences.length;
    ++d)a.deleteSync(this.readFences[d]), this.readFences[d] = null;
  for (d = this.nextPbo = 0;
    d <
    this.textures.length;
    ++d)a.deleteTexture(this.textures[d]);
  this.fbo1 && (a.deleteFramebuffer(this.fbo1), this.fbo1 = null);
  this.fbo2 && (a.deleteFramebuffer(this.fbo2), this.fbo2 = null)
};

HoloVideoObject.prototype.getLoadProgress = function () { return void 0 == this.minBuffers ? 0 : this.state >= HoloVideoObject.States.Opened ? 1 : (this.buffersLoaded + this.videosLoaded) / (this.minBuffers + this.minVideos) };

HoloVideoObject.prototype.setBuffers = function (a, d, e, b, g) {
  var l = {};
  l.posBuf = a;
  l.indexBuf = d;
  l.uvBuf = e;
  l.norBuf = b;
  l.tex = g;
  this.clientBuffers = l
};

HoloVideoObject.prototype.updateToLastKeyframe = function () { -1 != this.lastKeyframe && (this.frameIndex = this.lastKeyframe - 1, this.prevPrevMesh = this.prevMesh = this.curMesh = null) };

HoloVideoObject.prototype._loadFallbackFrame = function () {
  if (this.json && this.fallbackFrameBuffer) {
    if (!this.fallbackTextureImage) {
      this.fallbackTextureImage = new Image;
      var a = this.json.bufferViews[this.json.images[0].bufferView];
      this.fallbackTextureImage.src = "data:image/jpeg;base64," + function (a) {
        for (var b = "", c, d, e, f, g, k, l = 0;
          l < a.length;)c = a[l++], d = l < a.length ? a[l++] : Number.NaN, e = l < a.length ? a[l++] : Number.NaN, f = c >> 2, c = (c & 3) << 4 | d >> 4, g = (d & 15) << 2 | e >> 6, k = e & 63, isNaN(d) ? g = k = 64 : isNaN(e) && (k = 64), b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(f) +
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(g) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(k);
        return b
      }(new Uint8Array(this.fallbackFrameBuffer, a.byteOffset, a.byteLength));
      this.fallbackTextureImage.onload = function () {
        this._logInfo("fallback image loaded");
        this.fallbackTextureImage.loaded = !0
      }.bind(this)
    } if (this.fallbackTextureImage && this.fallbackTextureImage.loaded &&
      !this.filledFallbackFrame && this.clientBuffers && this.clientBuffers.posBuf) {
      a = this.gl;
      var d = this.json.meshes[0].primitives[0], e = a.getParameter(a.ARRAY_BUFFER_BINDING), b = a.getParameter(a.ELEMENT_ARRAY_BUFFER_BINDING), g = this.json.accessors[d.attributes.POSITION], l = this.json.bufferViews[g.bufferView];
      a.bindBuffer(a.ARRAY_BUFFER, this.clientBuffers.posBuf);
      a.bufferData(a.ARRAY_BUFFER, new Float32Array(this.fallbackFrameBuffer, l.byteOffset + g.byteOffset, 3 * g.count), a.STATIC_DRAW);
      this.clientBuffers.norBuf &&
        this.fileInfo.haveNormals && (g = this.json.accessors[d.attributes.NORMAL], l = this.json.bufferViews[g.bufferView], a.bindBuffer(a.ARRAY_BUFFER, this.clientBuffers.norBuf), a.bufferData(a.ARRAY_BUFFER, new Float32Array(this.fallbackFrameBuffer, l.byteOffset + g.byteOffset, 3 * g.count), a.STATIC_DRAW));
      g = this.json.accessors[d.attributes.TEXCOORD_0];
      l = this.json.bufferViews[g.bufferView];
      a.bindBuffer(a.ARRAY_BUFFER, this.clientBuffers.uvBuf);
      a.bufferData(a.ARRAY_BUFFER, new Uint16Array(this.fallbackFrameBuffer, l.byteOffset +
        g.byteOffset, 2 * g.count), a.STATIC_DRAW);
      g = this.json.accessors[d.indices];
      l = this.json.bufferViews[g.bufferView];
      a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.clientBuffers.indexBuf);
      g.componentType == a.UNSIGNED_SHORT ? a.bufferData(a.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.fallbackFrameBuffer, l.byteOffset + g.byteOffset, g.count), a.STATIC_DRAW) : a.bufferData(a.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fallbackFrameBuffer, l.byteOffset + g.byteOffset, g.count), a.STATIC_DRAW);
      a.bindBuffer(a.ARRAY_BUFFER, e);
      a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,
        b);
      a.pixelStorei(a.PACK_ALIGNMENT, 4);
      a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, !1);
      a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1);
      e = a.getParameter(a.TEXTURE_BINDING_2D);
      a.bindTexture(a.TEXTURE_2D, this.clientBuffers.tex);
      a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this.fallbackTextureImage);
      a.bindTexture(a.TEXTURE_2D, e);
      this.currentFrameInfo.primCount = g.count;
      g = this.json.accessors[d.extensions[HoloVideoObject._extName].attributes.POSITION];
      a = g.extensions[HoloVideoObject._extName].decodeMax;
      this.currentFrameInfo.bboxMin = g.extensions[HoloVideoObject._extName].decodeMin;
      this.currentFrameInfo.bboxMax = a;
      this.filledFallbackFrame = !0
    } return this.filledFallbackFrame
  }
};

HoloVideoObject.prototype.updateBuffers = function () {
  if (this.contextLost) return !1;
  if (!this.filledFallbackFrame && !this.seekTargetTime) return this._loadFallbackFrame();
  if (!this.json) return !1;
  var a = this.json.images[this.json.extensions[HoloVideoObject._extName].timeline[this.currentVideoIndex].image], d = a.video, e = !1;
  if (d && d.playing && !this.suspended) {
    var b = window.performance.now();
    if (20 > b - this.lastUpdate) return !1;
    this.lastVideoTime = 1E3 * d.currentTime;
    this.lastUpdate = b;
    b = this.gl;
    this.watermarkPixels || (this.watermarkPixels =
      new Uint8Array(4 * a.extensions[HoloVideoObject._extName].width));
    var g = -1, l = b.getParameter(b.FRAMEBUFFER_BINDING), f = b.getParameter(b.TEXTURE_BINDING_2D), m = this.caps.webgl2 && !this.createOptions.disableAsyncDecode;
    if (m) {
      var c = b.getParameter(b.PIXEL_PACK_BUFFER_BINDING), p = (this.nextPbo + 1) % this.pixelBuffers.length;
      if (null != this.readFences[p]) {
        b.getSyncParameter(this.readFences[p], b.SYNC_STATUS);
        b.deleteSync(this.readFences[p]);
        this.readFences[p] = null;
        b.bindBuffer(b.PIXEL_PACK_BUFFER, this.pixelBuffers[p]);
        b.getBufferSubData(b.PIXEL_PACK_BUFFER, 0, this.watermarkPixels, 0, this.watermarkPixels.byteLength);
        var r = 4 * a.extensions[HoloVideoObject._extName].blockSize;
        for (a = g = 0;
          16 > a;
          ++a)if (128 < this.watermarkPixels[r * a] || 128 < this.watermarkPixels[r * a + 4]) g += 1 << a
      } this.pixelBuffers[this.nextPbo] || (this.pixelBuffers[this.nextPbo] = b.createBuffer(), b.bindBuffer(b.PIXEL_PACK_BUFFER, this.pixelBuffers[this.nextPbo]), b.bufferData(b.PIXEL_PACK_BUFFER, this.watermarkPixels.byteLength, b.DYNAMIC_READ));
      b.pixelStorei(b.PACK_ALIGNMENT,
        4);
      b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL, !1);
      b.pixelStorei(b.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1);
      b.bindTexture(b.TEXTURE_2D, this.textures[this.nextPbo]);
      b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, d);
      b.bindFramebuffer(b.FRAMEBUFFER, this.fbo1);
      b.framebufferTexture2D(b.FRAMEBUFFER, b.COLOR_ATTACHMENT0, b.TEXTURE_2D, this.textures[this.nextPbo], 0);
      b.bindBuffer(b.PIXEL_PACK_BUFFER, this.pixelBuffers[this.nextPbo]);
      b.readPixels(0, 0, this.watermarkPixels.byteLength / 4, 1, b.RGBA, b.UNSIGNED_BYTE, 0);
      b.bindFramebuffer(b.FRAMEBUFFER,
        null);
      b.getError() == b.NO_ERROR ? (this.readFences[this.nextPbo] = b.fenceSync(b.SYNC_GPU_COMMANDS_COMPLETE, 0), this.nextPbo = (this.nextPbo + 1) % this.pixelBuffers.length) : this._logWarning("webgl error: " + n + " skipping video texture read");
      b.bindBuffer(b.PIXEL_PACK_BUFFER, c)
    } else {
      b.pixelStorei(b.PACK_ALIGNMENT, 4);
      b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL, !1);
      b.pixelStorei(b.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1);
      b.bindTexture(b.TEXTURE_2D, this.textures[0]);
      b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, d);
      var n = b.getError();
      if (n == b.NO_ERROR) {
        b.bindFramebuffer(b.FRAMEBUFFER, this.fbo1);
        b.framebufferTexture2D(b.FRAMEBUFFER, b.COLOR_ATTACHMENT0, b.TEXTURE_2D, this.textures[0], 0);
        b.readPixels(0, 0, this.watermarkPixels.byteLength / 4, 1, b.RGBA, b.UNSIGNED_BYTE, this.watermarkPixels);
        r = 4 * a.extensions[HoloVideoObject._extName].blockSize;
        for (a = g = 0;
          16 > a;
          ++a)if (128 < this.watermarkPixels[r * a] || 128 < this.watermarkPixels[r * a + 4]) g += 1 << a;
        n = !0;
        if (0 == g && g < this.lastVideoSampleIndex) {
          for (a = 0;
            a < this.watermarkPixels.byteLength;
            ++a)if (0 !=
              this.watermarkPixels[a]) {
              n = !1;
              break
            } if (n) return this._logWarning("dropping empty/black video frame"), this.currentFrameInfo.primCount = 0, !0
        }
      } else this._logWarning("webgl error: " + n + " skipping video texture read")
    } if (-1 < g && g != this.oldVideoSampleIndex) if (n = !0, this.seeking && this.requestKeyframe && (this._frameIsKeyframe(g) ? (this.requestKeyframe = !1, this.frameIndex = g - 1, this._logDebug("seeking found keyframe -> " + g)) : (this._logDebug("seeking wait for keyframe -> " + g), n = !1)), !n || null != this.curMesh && this.curMesh.frameIndex ==
      g) this.pendingVideoEndEvent && this.state == HoloVideoObject.States.Playing && (this.pendingVideoEndEventWaitCount++, e = 3 < this.pendingVideoEndEventWaitCount);
    else if (!(n = this.seeking) || g / this.json.extensions[HoloVideoObject._extName].framerate < this.seekTargetTime || (this.seeking = !1, this._logDebug("seeking finished at frame " + g), this.unmuteAfterSeek && (d.muted = !1)), this.seeking || !this.pauseAfterSeek || this.seekingAutoPlay || (this.pause(), d.playing = !1, delete this.pauseAfterSeek), c = !this.seeking, this.meshFrames[g].ensureBuffers()) {
      g <
        this.lastVideoSampleIndex && (this.frameIndex = -1, this._updateMesh(this.clientBuffers.posBuf, this.clientBuffers.uvBuf, this.clientBuffers.indexBuf, this.clientBuffers.norBuf, c, n), this._logInfo("loop detected, videoSampleIndex = " + g + ", curMesh.frameIndex = " + this.curMesh.frameIndex));
      for (;
        (null == this.curMesh || this.curMesh.frameIndex < g) && this._updateMesh(this.clientBuffers.posBuf, this.clientBuffers.uvBuf, this.clientBuffers.indexBuf, this.clientBuffers.norBuf, c, n););
      this._logDebug("updated to frame index = " +
        g);
      if (this.curMesh.frameIndex == g && c) if (n = d.videoWidth, c = d.videoHeight, m) b.bindFramebuffer(b.READ_FRAMEBUFFER, this.fbo1), b.framebufferTexture2D(b.READ_FRAMEBUFFER, b.COLOR_ATTACHMENT0, b.TEXTURE_2D, this.textures[p], 0), b.readBuffer(b.COLOR_ATTACHMENT0), b.bindFramebuffer(b.DRAW_FRAMEBUFFER, this.fbo2), b.framebufferTexture2D(b.DRAW_FRAMEBUFFER, b.COLOR_ATTACHMENT0, b.TEXTURE_2D, this.clientBuffers.tex, 0), b.drawBuffers([b.COLOR_ATTACHMENT0]), b.blitFramebuffer(0, 0, n, c, 0, 0, n, c, b.COLOR_BUFFER_BIT, b.NEAREST);
      else {
        p =
          this.texCopyShader;
        m = b.getParameter(b.ARRAY_BUFFER_BINDING);
        a = b.getParameter(b.CURRENT_PROGRAM);
        r = b.getParameter(b.VIEWPORT);
        var h = b.isEnabled(b.SCISSOR_TEST), k = b.isEnabled(b.CULL_FACE), t = b.isEnabled(b.BLEND), q = b.getParameter(b.ACTIVE_TEXTURE), v = b.getVertexAttrib(p.vertexAttribLoc, b.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING), z = b.getVertexAttrib(p.vertexAttribLoc, b.VERTEX_ATTRIB_ARRAY_ENABLED), w = b.getVertexAttrib(p.vertexAttribLoc, b.VERTEX_ATTRIB_ARRAY_SIZE), u = b.getVertexAttrib(p.vertexAttribLoc, b.VERTEX_ATTRIB_ARRAY_TYPE),
          x = b.getVertexAttrib(p.vertexAttribLoc, b.VERTEX_ATTRIB_ARRAY_NORMALIZED), y = b.getVertexAttrib(p.vertexAttribLoc, b.VERTEX_ATTRIB_ARRAY_STRIDE), B = b.getVertexAttribOffset(p.vertexAttribLoc, b.VERTEX_ATTRIB_ARRAY_POINTER);
        b.bindFramebuffer(b.FRAMEBUFFER, this.fbo2);
        b.framebufferTexture2D(b.FRAMEBUFFER, b.COLOR_ATTACHMENT0, b.TEXTURE_2D, this.clientBuffers.tex, 0);
        b.viewport(0, 0, n, c);
        b.disable(b.SCISSOR_TEST);
        b.disable(b.CULL_FACE);
        b.disable(b.BLEND);
        b.clear(b.COLOR_BUFFER_BIT);
        b.activeTexture(b.TEXTURE0);
        b.bindTexture(b.TEXTURE_2D,
          this.textures[0]);
        b.useProgram(p);
        b.uniform1i(p.textureSamplerLoc, 0);
        b.bindBuffer(b.ARRAY_BUFFER, this.texCopyVerts);
        b.enableVertexAttribArray(p.vertexAttribLoc);
        b.vertexAttribPointer(p.vertexAttribLoc, 2, b.FLOAT, !1, 0, 0);
        b.drawArrays(b.TRIANGLES, 0, 3);
        b.useProgram(a);
        b.bindBuffer(b.ARRAY_BUFFER, v);
        b.vertexAttribPointer(p.vertexAttribLoc, w, u, x, y, B);
        z ? b.enableVertexAttribArray(p.vertexAttribLoc) : b.disableVertexAttribArray(p.vertexAttribLoc);
        b.bindBuffer(b.ARRAY_BUFFER, m);
        b.viewport(r[0], r[1], r[2], r[3]);
        h && b.enable(b.SCISSOR_TEST);
        t && b.enable(b.BLEND);
        k && b.enable(b.CULL_FACE);
        b.activeTexture(q)
      } this.curMesh && this.curMesh.frameIndex != g && this._logInfo("texture (" + g + ") <-> mesh (" + this.curMesh.frameIndex + ") mismatch");
      this.lastVideoSampleIndex = g
    } else this._logWarning("ran out of mesh data, suspending video " + d.mp4Name), d.pause(), this.needMeshData = this.suspended = !0, this.pendingBufferDownload || this._loadNextBuffer();
    b.bindFramebuffer(b.FRAMEBUFFER, l);
    b.bindTexture(b.TEXTURE_2D, f)
  } this.pendingVideoEndEvent &&
    (this.lastVideoSampleIndex == this.meshFrames.length - 1 || e) && (d.playing = !1, this._onVideoEnded(d), this.pendingVideoEndEvent = !1);
  if (this.curMesh && !this.seeking) {
    this.currentFrameInfo.primCount = this.curMesh.indexCount;
    this.currentFrameInfo.frameIndex = this.curMesh.frameIndex;
    if (this.onUpdateCurrentFrame) this.onUpdateCurrentFrame(this.curMesh.frameIndex);
    return !0
  } return !1
};

HoloVideoObject.prototype.close = function () {
  this.httpRequest && (this.httpRequest.abort(), this.httpRequest = null);
  this.dashPlayer && this.dashPlayer.reset();
  for (var a = 0;
    a < this.videoElements.length;
    ++a)this.videoElements[a].pause(), this.videoElements[a].removeAttribute("src");
  this.state = HoloVideoObject.States.Closed
};

HoloVideoObject.prototype.pause = function () { 0 < this.videoElements.length && this.videoElements[this.currentVideoIndex] && (this.videoElements[this.currentVideoIndex].pause(), this.state = HoloVideoObject.States.Paused) };

HoloVideoObject.prototype.setAudioVolume = function (a) {
  this.audioVolume = a;
  this.videoElements[this.currentVideoIndex].volume = a
};

HoloVideoObject.prototype.setAutoLooping = function (a) {
  this.openOptions.autoloop = a;
  this.videoElements[this.currentVideoIndex].loop = a
};

HoloVideoObject.prototype.setAudioEnabled = function (a) { this.videoElements[this.currentVideoIndex].muted = !a };

HoloVideoObject.prototype.audioEnabled = function () { return !this.videoElements[this.currentVideoIndex].muted };

HoloVideoObject.prototype.play = function () {
  var a = this;
  this.isSafari && this.videoElements[this.currentVideoIndex].pause();
  var d = this.videoElements[this.currentVideoIndex].play();
  void 0 !== d && d.then(function (d) { a.state = HoloVideoObject.States.Playing }).catch(function (d) {
    a._logWarning("play prevented: " + d);
    a._onError(HoloVideoObject.ErrorStates.PlaybackPrevented, d)
  })
};

HoloVideoObject.prototype.open = function (a, d) {
  this.state >= HoloVideoObject.States.Opening && this.close();
  this.state = HoloVideoObject.States.Opening;
  this.urlRoot = a.substring(0, a.lastIndexOf("/") + 1);
  this.meshFrames = [];
  this.videosLoaded = this.buffersLoaded = 0;
  this.freeArrayBuffers = [];
  this.freeVideoElements = [];
  this.buffers = [];
  void 0 === this.videoElements && (this.videoElements = []);
  this.nextBufferLoadIndex = this.nextVideoLoadIndex = 0;
  this.videoState = HoloVideoObject.VideoStates.Undefined;
  this.currentFrameInfo = { primCount: 0 };
  this.currentVideoIndex = 0;
  this.currentBufferIndex = -1;
  this.lastUpdate = this.lastVideoTime = 0;
  this.json = null;
  this.fileInfo = { haveNormals: !1, octEncodedNormals: !1 };
  this.openOptions = d ? d : {};
  this.openOptions.minBuffers || (this.openOptions.minBuffers = 2);
  this.openOptions.maxBuffers || (this.openOptions.maxBuffers = 3);
  if (this.readFences) for (d = 0;
    d < this.readFences.length;
    ++d)this.readFences[d] && (this.gl.deleteSync(this.readFences[d]), this.readFences[d] = null);
  this.nextPbo = 0;
  this.prevPrevMesh = this.prevMesh = this.curMesh =
    null;
  this.lastKeyframe = this.frameIndex = -1;
  this.lastKeyframeUVs = this.lastKeyframeIndices = null;
  this.lastVideoSampleIndex = -1;
  this.filledFallbackFrame = !1;
  this.fallbackTextureImage = this.fallbackFrameBuffer = null;
  this.eos = !1;
  delete this.seekTargetTime;
  delete this.searchStartFrame;
  this._loadJSON(a, this._onJsonLoaded.bind(this))
};

"undefined" != typeof THREE && (HoloVideoObjectThreeJS = function (a, d, e, b, g) {
  var l = new HoloVideoObject(a.getContext(), e, g);
  this.hvo = l;
  this.renderer = a;
  l.onEndOfStream = this._hvoOnEndOfStream.bind(this);
  l.onUpdateCurrentFrame = b;
  l.onLoaded = function (b) {
    this.fileInfo = b;
    var c = b.haveNormals, e = new THREE.MeshBasicMaterial({ map: null, transparent: !1, side: THREE.DoubleSide }), f = new THREE.MeshLambertMaterial({ map: null, transparent: !1, side: THREE.DoubleSide }), g = this.hvo.meshFrames[0].indices.componentType, h = a.getContext();
    if (this.mesh) {
      var k = this.mesh.geometry.getIndex(), m = void 0 != this.mesh.geometry.getAttribute("normal");
      if (k.type != g || m != c) this.mesh = null;
      else {
        var q = c ? f : e;
        q.map = this.mesh.material.map;
        this.mesh.material = q
      }
    } if (!this.mesh) {
      k = new THREE.BufferGeometry;
      k.boundingSphere = new THREE.Sphere;
      k.boundingSphere.set(new THREE.Vector3, Infinity);
      k.boundingBox = new THREE.Box3;
      k.boundingBox.set(new THREE.Vector3(-Infinity, -Infinity, -Infinity), new THREE.Vector3(Infinity, Infinity, Infinity));
      m = h.createBuffer();
      var v = 120 <=
        THREE.REVISION ? new THREE.GLBufferAttribute(m, h.FLOAT, 3, 0) : new THREE.GLBufferAttribute(h, m, h.FLOAT, 3, 0);
      k.setAttribute("position", v);
      v = null;
      if (c) {
        v = h.createBuffer();
        var z = 120 <= THREE.REVISION ? new THREE.GLBufferAttribute(v, h.FLOAT, 3, 0) : new THREE.GLBufferAttribute(h, v, h.FLOAT, 3, 0);
        k.setAttribute("normal", z)
      } z = h.createBuffer();
      var w = 120 <= THREE.REVISION ? new THREE.GLBufferAttribute(z, h.UNSIGNED_SHORT, 2, 0) : new THREE.GLBufferAttribute(h, z, h.UNSIGNED_SHORT, 2, 0);
      w.normalized = !0;
      k.setAttribute("uv", w);
      w = h.createBuffer();
      g = 120 <= THREE.REVISION ? new THREE.GLBufferAttribute(w, g, 0, 0) : new THREE.GLBufferAttribute(h, w, g, 0, 0);
      k.setIndex(g);
      var u = new THREE.Texture;
      u.encoding = THREE.sRGBEncoding;
      g = a.properties.get(u);
      g.__webglTexture = h.createTexture();
      q = h.getParameter(h.TEXTURE_BINDING_2D);
      h.bindTexture(h.TEXTURE_2D, g.__webglTexture);
      h.texImage2D(h.TEXTURE_2D, 0, h.RGBA, b.videoWidth, b.videoHeight, 0, h.RGBA, h.UNSIGNED_BYTE, null);
      h.texParameteri(h.TEXTURE_2D, h.TEXTURE_WRAP_S, h.CLAMP_TO_EDGE);
      h.texParameteri(h.TEXTURE_2D, h.TEXTURE_WRAP_T,
        h.CLAMP_TO_EDGE);
      h.texParameteri(h.TEXTURE_2D, h.TEXTURE_MIN_FILTER, h.LINEAR);
      h.texParameteri(h.TEXTURE_2D, h.TEXTURE_MAG_FILTER, h.LINEAR);
      h.bindTexture(h.TEXTURE_2D, q);
      q = c ? f : e;
      q.map = u;
      b = new THREE.Mesh(k, q);
      b.scale.x = .001;
      b.scale.y = .001;
      b.scale.z = .001;
      l.setBuffers(m, w, z, v, g.__webglTexture);
      this.mesh = b;
      this.bufferGeometry = k
    } this.state = this.hvo.state;
    d(this.mesh)
  }.bind(this);
  var f = a.getContext();
  e = f.canvas;
  e.addEventListener("webglcontextlost", function (a) { this.mesh && f.deleteTexture(this.mesh.material.map.__webglTexture) }.bind(this),
    !1);
  e.addEventListener("webglcontextrestored", function (b) {
    if (this.mesh) {
      var c = this.mesh.geometry, d = null;
      b = f.createBuffer();
      var e = 120 <= THREE.REVISION ? new THREE.GLBufferAttribute(b, f.FLOAT, 3, 0) : new THREE.GLBufferAttribute(f, b, f.FLOAT, 3, 0);
      c.setAttribute("position", e);
      if (e = c.attributes.normal) d = f.createBuffer(), e = 120 <= THREE.REVISION ? new THREE.GLBufferAttribute(d, f.FLOAT, 3, 0) : new THREE.GLBufferAttribute(f, d, f.FLOAT, 3, 0), c.setAttribute("normal", e);
      e = f.createBuffer();
      var g = 120 <= THREE.REVISION ? new THREE.GLBufferAttribute(e,
        f.UNSIGNED_SHORT, 2, 0) : new THREE.GLBufferAttribute(f, e, f.UNSIGNED_SHORT, 2, 0);
      g.normalized = !0;
      c.setAttribute("uv", g);
      var h = this.hvo.meshFrames[0].indices.componentType;
      g = f.createBuffer();
      h = 120 <= THREE.REVISION ? new THREE.GLBufferAttribute(g, h, 0, 0) : new THREE.GLBufferAttribute(f, g, h, 0, 0);
      c.setIndex(h);
      c = new THREE.Texture;
      c.encoding = THREE.sRGBEncoding;
      h = a.properties.get(c);
      h.__webglTexture = f.createTexture();
      var k = f.getParameter(f.TEXTURE_BINDING_2D);
      f.bindTexture(f.TEXTURE_2D, h.__webglTexture);
      f.texImage2D(f.TEXTURE_2D,
        0, f.RGBA, this.fileInfo.videoWidth, this.fileInfo.videoHeight, 0, f.RGBA, f.UNSIGNED_BYTE, null);
      f.texParameteri(f.TEXTURE_2D, f.TEXTURE_WRAP_S, f.CLAMP_TO_EDGE);
      f.texParameteri(f.TEXTURE_2D, f.TEXTURE_WRAP_T, f.CLAMP_TO_EDGE);
      f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MIN_FILTER, f.LINEAR);
      f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MAG_FILTER, f.LINEAR);
      f.bindTexture(f.TEXTURE_2D, k);
      this.mesh.material.map = c;
      this.hvo.setBuffers(b, g, e, d, h.__webglTexture);
      this.hvo.updateToLastKeyframe();
      this.bufferGeometry.index.count =
        0
    }
  }.bind(this), !1)
}, HoloVideoObjectThreeJS.prototype._hvoOnEndOfStream = function (a) { if (this.onEndOfStream) this.onEndOfStream(this) }, HoloVideoObjectThreeJS.prototype.open = function (a, d) {
  this.state > HoloVideoObject.States.Empty && this.close();
  this.hvo.open(a, d);
  this.state = this.hvo.state
}, HoloVideoObjectThreeJS.prototype.update = function () {
  this.hvo && this.mesh && (this.state = this.hvo.state);
  if (this.hvo.updateBuffers()) {
    var a = this.hvo.currentFrameInfo.bboxMin, d = this.hvo.currentFrameInfo.bboxMax, e = this.bufferGeometry;
    e.boundingBox.min.x = a[0];
    e.boundingBox.min.y = a[1];
    e.boundingBox.min.z = a[2];
    e.boundingBox.max.x = d[0];
    e.boundingBox.max.y = d[1];
    e.boundingBox.max.z = d[2];
    e.boundingBox.getCenter(e.boundingSphere.center);
    e.boundingSphere.radius = .5 * Math.max(d[0] - a[0], d[1] - a[1], d[2] - a[2]);
    e.index.count = this.hvo.currentFrameInfo.primCount
  }
}, HoloVideoObjectThreeJS.prototype.rewind = function () { this.hvo.rewind() }, HoloVideoObjectThreeJS.prototype.seekToTime = function (a, d) { this.hvo.seekToTime(a, d) }, HoloVideoObjectThreeJS.prototype.play =
  function () { this.hvo.state == HoloVideoObject.States.Opening ? this.hvo.forceLoad() : this.hvo.state >= HoloVideoObject.States.Opened && this.hvo.state != HoloVideoObject.States.Playing && this.hvo.play() }, HoloVideoObjectThreeJS.prototype.close = function () {
    this.bufferGeometry && (this.bufferGeometry.index.count = 0);
    this.hvo.close()
  }, HoloVideoObjectThreeJS.prototype.pause = function () { this.hvo.pause() }, HoloVideoObjectThreeJS.prototype.setLogLevel = function (a) { this.hvo.logLevel = a }, HoloVideoObjectThreeJS.prototype.setAudioEnabled =
  function (a) { this.hvo.setAudioEnabled(a) }, HoloVideoObjectThreeJS.prototype.audioEnabled = function () { return this.hvo.audioEnabled() }, HoloVideoObjectThreeJS.prototype.setAudioVolume = function (a) { this.hvo.setAudioVolume(a) }, HoloVideoObjectThreeJS.prototype.setAutoLooping = function (a) { this.hvo.setAutoLooping(a) });

HoloVideoObject._instanceCounter = 0;
HoloVideoObject.States = { Closed: -1, Empty: 0, Opening: 1, Opened: 2, Playing: 3, Paused: 4 };
HoloVideoObject.ErrorStates = { NetworkError: -1, VideoError: -2, PlaybackPrevented: -3 };
HoloVideoObject.StreamMode = { Automatic: 0, MP4: 1, HLS: 2, Dash: 3 };
HoloVideoObject.VideoStates = { Undefined: 0, CanPlay: 1, CanPlayThrough: 2, Waiting: 3, Suspended: 4, Stalled: 5, Playing: 6 };
HoloVideoObject._extName = "HCAP_holovideo";
HoloVideoObject.Version = {};
HoloVideoObject.Version.Major = 1;
HoloVideoObject.Version.Minor = 4;
HoloVideoObject.Version.Patch = 0;
HoloVideoObject.Version.String = HoloVideoObject.Version.Major + "." + HoloVideoObject.Version.Minor + "." + HoloVideoObject.Version.Patch;
