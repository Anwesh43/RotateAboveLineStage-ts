var w = window.innerWidth, h = window.innerHeight;
var RotateAboveLineStage = (function () {
    function RotateAboveLineStage() {
        this.canvas = document.createElement('canvas');
        this.lral = new LinkedRAL();
        this.animator = new Animator();
        this.initCanvas();
    }
    RotateAboveLineStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    RotateAboveLineStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.lral.draw(this.context);
    };
    RotateAboveLineStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.lral.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.lral.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    RotateAboveLineStage.init = function () {
        var stage = new RotateAboveLineStage();
        stage.render();
        stage.handleTap();
    };
    return RotateAboveLineStage;
})();
var State = (function () {
    function State() {
        this.dir = 0;
        this.scale = 0;
        this.prevScale = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.05 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var nodes = 5;
var drawRALNode = function (context, i, scale) {
    var deg = (2 * Math.PI) / nodes;
    var size = Math.min(w, h) / 3;
    var index = i % 2;
    var sc1 = Math.min(0.5, scale) * 2;
    var sc2 = Math.min(0.5, Math.max(0, scale - 0.5)) * 2;
    var scale2 = (1 - index) * sc1 + (1 - sc1) * index;
    context.save();
    context.rotate(i * deg + deg * sc2);
    for (var j = 0; j < 2; j++) {
        context.save();
        context.translate(size / 2, 0);
        context.rotate(-Math.PI * scale2 * j);
        context.beginPath();
        context.moveTo(-size / 2, 0);
        context.lineTo(0, 0);
        context.stroke();
        context.restore();
    }
    context.restore();
};
var RALNode = (function () {
    function RALNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    RALNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new RALNode(this.i + 1);
            this.next.prev = this;
        }
    };
    RALNode.prototype.draw = function (context) {
        drawRALNode(context, this.i, this.state.scale);
        if (this.next) {
            this.next.draw(context);
        }
    };
    RALNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    RALNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    RALNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return RALNode;
})();
var LinkedRAL = (function () {
    function LinkedRAL() {
        this.curr = new RALNode(0);
        this.dir = 1;
    }
    LinkedRAL.prototype.draw = function (context) {
        context.strokeStyle = 'orange';
        context.lineWidth = Math.min(w, h) / 60;
        context.lineCap = 'round';
        context.save();
        context.translate(w / 2, h / 2);
        this.curr.draw(context);
        context.restore();
    };
    LinkedRAL.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedRAL.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedRAL;
})();
