const _privateMap = new WeakMap();
export default class ObjectWithPrivateValues {
    protected getPrivate(key) {
        const privateDatas = this.privateMap.get(this);
        return privateDatas[key];
    }

    protected setPrivate(key, value) {
        const privateDatas = this.privateMap.get(this) || {};
        privateDatas[key] = value;
        this.privateMap.set(this, privateDatas);
    }

    protected get privateMap(): WeakMap<any, any> {
        return _privateMap;
    }
}
