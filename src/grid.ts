
export interface Grid<T> {
    width: number;
    height: number;
    get(x: number, y: number): T;
    set(x: number, y: number, value: T): void;
    iterateTopToBottom(): IterableIterator<IterableIterator<T>>;
    iterateRow(rowIndex: number): IterableIterator<T>;
}

export class ArrayGrid<T> implements Grid<T> {

    private readonly _data: T[]
    private readonly _width: number;
    private readonly _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._data = new Array(width * height);
    }

    public get width() {
        return this._width;
    }

    public get height() {
        return this._height;
    }

    public get(x: number, y: number): T {
        return this._data[x + y * this._width];
    }

    public set(x: number, y: number, value: T) {
        this._data[x + y * this._width] = value;
    }

    public* iterateTopToBottom(): IterableIterator<IterableIterator<T>> {
        const start = 0;
        const end = this.height;
        for (let i = start; i < end; ++i) {
            yield this.iterateRow(i)
        }
    }

    public* iterateRow(y: number): IterableIterator<T> {
        const rowStart = y * this._width;
        const rowSend = rowStart + this._width;
        for (let i = rowStart; i < rowSend; i++) {
            yield this._data[i];
        }
    }
}