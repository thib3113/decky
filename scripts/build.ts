import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import appRoot from 'app-root-path';

const logFile = path.join(appRoot.path, 'build.log');
if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
}
var logStream = fs.createWriteStream(logFile, { flags: 'a' });

const frontFolder = path.join(appRoot.path, 'front');
const appFolder = path.join(appRoot.path, 'app');
async function main() {
    try {
        console.log('remove app folder');
        await fs.promises.rmdir(appFolder, { recursive: true });
        await Promise.all([
            new Promise((resolve, reject) => {
                if (!fs.existsSync(frontFolder)) {
                    throw new Error(`front folder doesn't exist`);
                }
                console.log('start build front');
                const buildFront = spawn('yarn', ['build'], { cwd: frontFolder, shell: true });
                buildFront.on('error', (error) => {
                    reject(error);
                });

                buildFront.on('close', (code) => {
                    console.log(`end build front, succeed ? ${code === 0 ? 'true' : 'false'}`);
                    resolve();
                });

                buildFront.stdout.pipe(logStream);
                buildFront.stderr.pipe(logStream);
            }),
            new Promise((resolve, reject) => {
                console.log('start build back');
                const buildBack = spawn('yarn', ['build:back'], { cwd: appRoot.path, shell: true });
                buildBack.on('error', (error) => {
                    reject(error);
                });

                buildBack.on('close', (code) => {
                    console.log(`end build back, succeed ? ${code === 0 ? 'true' : 'false'}`);
                    resolve();
                });

                buildBack.stdout.pipe(logStream);
                buildBack.stderr.pipe(logStream);
            })
        ]);

        await fs.promises.rename(path.join(frontFolder, 'build'), path.join(appFolder, 'front'));
    } catch (e) {
    } finally {
        logStream.close();
    }
}

main();
