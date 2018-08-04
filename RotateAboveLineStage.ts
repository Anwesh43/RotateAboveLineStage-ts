const w : number = window.innerWidth, h : number = window.innerHeight
class RotateAboveLineStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : RotateAboveLineStage = new RotateAboveLineStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    dir : number = 0
    scale : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        this.dir = 0
        this.prevScale = this.scale
        cb()
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
      if (!this.animated) {
          this.animated = true
          this.interval = setInterval(() => {
              cb()
          }, 50)
      }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

const nodes : number = 5

const drawRALNode = (context, i : number, scale : number) => {
    const deg : number = (2 * Math.PI) / nodes
    const size : number = Math.min(w, h) / 3
    const index : number = i % 2
    const sc1 = Math.min(0.5, scale) * 2
    const sc2 : number = Math.min(0.5, Math.max(0.5, scale - 0.5)) * 2
    const scale2 = (1 - index) * sc1 + (1 - sc1) * index
    context.save()
    context.rotate(deg)
    for(var j = 0; j < 2; j++) {
        context.save()
        context.translate(size/2, 0)
        context.rotate(Math.PI * scale2 * j)
        context.beginPath()
        context.moveTo(-size/2, 0)
        context.lineTo(0, 0)
        context.stroke()
        context.restore()
    }
    context.restore()
}

class RALNode {

    private next : RALNode
    private prev : RALNode
    private state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new RALNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawRALNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RALNode {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return this
        }
        cb()
        return this
    }
}

class LinkedRAL {
    curr : RALNode = new RALNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
