import path from 'path';
import Databases from '../../src/objects/Databases/Databases';
import Validate from '../../src/objects/Validate';
import Board from '../../src/objects/Boards/Board';
import BoardsService from '../../src/objects/Boards/BoardsService';

beforeAll(() => {
    Databases.setDatabaseFolder(path.join(__dirname, '..', 'datas', 'databases', 'set_1'));
});

describe('test CRUD', () => {
    describe('getList', () => {
        it('should return list of actions', async () => {
            const res = await BoardsService.getList();

            expect(Array.isArray(res)).toBeTruthy();
            expect(res.length).toBeGreaterThan(0);
            expect(res).toContainEqual({ name: 'test', uuid: 'f8a90c29-de12-4145-b6de-95c4b96f8eab' });
            expect(res).toContainEqual({ uuid: 'fed82e41-ce89-4e9b-8402-c6078d3dd0bc' });
        });

        it('should return list of actions with uuid fed82e41-ce89-4e9b-8402-c6078d3dd0bc', async () => {
            const res = await BoardsService.getList({ uuid: 'fed82e41-ce89-4e9b-8402-c6078d3dd0bc' });

            expect(Array.isArray(res)).toBeTruthy();
            expect(res.length).toEqual(1);
            expect(res).toContainEqual({ uuid: 'fed82e41-ce89-4e9b-8402-c6078d3dd0bc' });
            expect(res).not.toContainEqual({ name: 'test', uuid: 'f8a90c29-de12-4145-b6de-95c4b96f8eab' });
        });

        it('should return list of actions with name test and uuid f8a90c29-de12-4145-b6de-95c4b96f8eab', async () => {
            const res = await BoardsService.getList({ name: 'test', uuid: 'f8a90c29-de12-4145-b6de-95c4b96f8eab' });

            expect(Array.isArray(res)).toBeTruthy();
            expect(res.length).toEqual(1);
            expect(res[0]).toBeInstanceOf(Board);
            expect(res).toContainEqual({ name: 'test', uuid: 'f8a90c29-de12-4145-b6de-95c4b96f8eab' });
            expect(res).not.toContainEqual({ name: 'test', uuid: '7ec8aa3b-d895-4257-be12-8aeda6d78e3a' });
        });
    });

    describe('getByUUid', () => {
        it('should return the action with uuid 7ec8aa3b-d895-4257-be12-8aeda6d78e3a', async () => {
            const res = await BoardsService.getByUUid('7ec8aa3b-d895-4257-be12-8aeda6d78e3a');

            expect(Array.isArray(res)).toBeFalsy();
            expect(res).toBeInstanceOf(Board);
            expect(res).toEqual({ name: 'test', uuid: '7ec8aa3b-d895-4257-be12-8aeda6d78e3a' });
        });
    });

    describe('createNew', () => {
        it('should create an action with random uuid', async () => {
            const res = await BoardsService.create({
                name: 'test-create'
            });

            expect(Array.isArray(res)).toBeFalsy();
            expect(res).toBeInstanceOf(Board);
            expect(res.name).toEqual('test-create');
            expect(Validate.uuid(res.uuid)).toBeTruthy();

            const res2 = await BoardsService.getByUUid(res.uuid);
            expect(res.uuid).toBe(res2.uuid);
            expect(res.name).toBe(res2.name);

            //delete it
            await res.delete();
        });

        // it('debug', async () => {
        //     await Promise.all(['test', 'test 1', 'test 2'].map(async name => {
        //         const res = await BoardsService.create({
        //             name
        //         });
        //     }));
        // })
    });
});
