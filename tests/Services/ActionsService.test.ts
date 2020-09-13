import ActionsService from '../../src/objects/Actions/ActionsService';
import path from 'path';
import Action from '../../src/objects/Actions/Action';
import Databases from '../../src/objects/Databases/Databases';
import Validate from "../../src/objects/Validate";

beforeAll(() => {
    Databases.setDatabaseFolder(path.join(__dirname, '..', 'datas', 'databases', 'set_1'));
});

describe('test CRUD', () => {
    describe('getList', () => {
        it('should return list of actions', async () => {
            const res = await ActionsService.getList();

            expect(Array.isArray(res)).toBeTruthy();
            expect(res.length).toBeGreaterThan(0);
            expect(res).toContainEqual({ name: 'test', uuid: '38ef0580-c358-4f09-9621-e8b291d86987' });
            expect(res).toContainEqual({ uuid: 'ea56722e-834d-4abd-83de-e6ef7c2f95c7' });
        });

        it('should return list of actions with uuid ea56722e-834d-4abd-83de-e6ef7c2f95c7', async () => {
            const res = await ActionsService.getList({ uuid: 'ea56722e-834d-4abd-83de-e6ef7c2f95c7' });

            expect(Array.isArray(res)).toBeTruthy();
            expect(res.length).toEqual(1);
            expect(res).toContainEqual({ uuid: 'ea56722e-834d-4abd-83de-e6ef7c2f95c7' });
            expect(res).not.toContainEqual({ name: 'test', uuid: '38ef0580-c358-4f09-9621-e8b291d86987' });
        });

        it('should return list of actions with name test and uuid 38ef0580-c358-4f09-9621-e8b291d86987', async () => {
            const res = await ActionsService.getList({ name: 'test', uuid: '38ef0580-c358-4f09-9621-e8b291d86987' });

            expect(Array.isArray(res)).toBeTruthy();
            expect(res.length).toEqual(1);
            expect(res[0]).toBeInstanceOf(Action);
            expect(res).toContainEqual({ name: 'test', uuid: '38ef0580-c358-4f09-9621-e8b291d86987' });
            expect(res).not.toContainEqual({ name: 'test 2', uuid: '38ef0580-c358-4f09-9621-e8b291d86987' });
            expect(res).not.toContainEqual({ uuid: 'ea56722e-834d-4abd-83de-e6ef7c2f95c7' });
        });
    });

    describe('getByUUid', () => {
        it('should return the action with uuid ea56722e-834d-4abd-83de-e6ef7c2f95c7', async () => {
            const res = await ActionsService.getByUUid('ea56722e-834d-4abd-83de-e6ef7c2f95c7');

            expect(Array.isArray(res)).toBeFalsy();
            expect(res).toBeInstanceOf(Action);
            expect(res).toEqual({ uuid: 'ea56722e-834d-4abd-83de-e6ef7c2f95c7' });
        });
    });

    describe('createNew', () => {
        it('should create an action with random uuid', async () => {
            const res = await ActionsService.create({
                name: 'test-create'
            });

            expect(Array.isArray(res)).toBeFalsy();
            expect(res).toBeInstanceOf(Action);
            expect(res.name).toEqual( 'test-create');
            expect(Validate.uuid(res.uuid)).toBeTruthy();

            const res2 = await ActionsService.getByUUid(res.uuid);
            expect(res.uuid).toBe(res2.uuid);
            expect(res.name).toBe(res2.name);

            //delete it
            await res.delete();
        });
    });
});
