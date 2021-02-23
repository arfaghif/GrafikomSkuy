import GLObject from './GLObject'


class Renderer {
    public objectList: Array<GLObject>;
    public count: number;


    constructor() {
        this.objectList = new Array<GLObject>();
        this.count = 0;
    }


    addObject(obj: GLObject) {
        this.objectList.push(obj)
        this.count++
    }


    removeObject(id: number) {
        const idx = this.objectList.findIndex(obj => obj.id === id)
        this.objectList.splice(idx, 1)
        this.count--
    }


    render() {
        for (const obj of this.objectList) {
            obj.draw()
        }
    }
}


export default Renderer