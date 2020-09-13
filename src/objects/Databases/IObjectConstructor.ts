interface IObjectConstructor<T> {
    new (arg: Partial<T> & { uuid: string }): T;
}
