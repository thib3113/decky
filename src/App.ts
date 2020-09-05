import Initiator from './objects/Initiator';
import { app, BrowserWindow, BrowserWindowConstructorOptions, Rectangle } from 'electron';
import path from 'path';
import appRoot from 'app-root-path';
import express, { Express } from 'express';
import http from 'http';
import getPort from 'get-port';
import socketIo from 'socket.io';
import fallback from 'express-history-api-fallback';
import compression from 'compression';
import {__LOGUUID, config, logger} from './global';
import { debounce } from "debounce";
import {createNamespace} from "cls-hooked";
import { v4 as uuidv4 } from 'uuid';

const frontPath = path.join(appRoot.path, 'app', 'front');

export default class App {
    private expressApp: Express;
    private httpServer: http.Server;
    private io: socketIo.Server;

    init(): Promise<void> {
        return Initiator.init();
    }

    async start(): Promise<void> {
        this.expressApp = express();
        this.httpServer = http.createServer(this.expressApp);

        //start electron app
        await app.whenReady();

        //enable serving front
        this.expressApp.use(compression());
        this.expressApp.use(express.static(frontPath));
        this.expressApp.use(fallback('index.html', { root: frontPath }));

        // get free port
        const port = await getPort({
            port: config.PORT || Number(process.env.PORT) || [1337, 3000, 3113]
        });

        // if port in config != port => reject
        if (config.PORT && Number(config.PORT) !== Number(port)) {
            throw new Error(`the PORT specified in configuration "${config.PORT}" seems unavailable, choose another one please !`);
        }

        this.httpServer.listen(port, '0.0.0.0', () => {
            logger.info(`app is listening on port ${port}`);
        });

        this.io = socketIo(this.httpServer);

        this.io.on('connection', (socket) => {
            const session = createNamespace('session');
            session.set(__LOGUUID, uuidv4());
            session.set('socket', socket);
            logger.debug(`a user connected : ${socket.id}`);
        });

        //prepare BrowserWindow configuration
        let browserWindowConfig: BrowserWindowConstructorOptions = {
            width: config.BROWSER_WINDOWS_WIDTH,
            height: config.BROWSER_WINDOWS_HEIGHT,
            // frame: false,
            // transparent: true
        };

        // X and Y are primary screen relative, can be negative for a screen on the left, or upper
        if (config.BROWSER_WINDOWS_X && config.BROWSER_WINDOWS_Y ) {
            browserWindowConfig.x = config.BROWSER_WINDOWS_X;
            browserWindowConfig.y = config.BROWSER_WINDOWS_Y;
        }

        // create browser windows
        const win = new BrowserWindow(browserWindowConfig);

        const updateBounds = debounce((bounds: Rectangle) => {
            logger.verbose(`change bounds to ${JSON.stringify(bounds)}`);
            config.BROWSER_WINDOWS_Y = bounds.y;
            config.BROWSER_WINDOWS_X = bounds.x;
            config.BROWSER_WINDOWS_WIDTH = bounds.width;
            config.BROWSER_WINDOWS_HEIGHT = bounds.height;
            config.save();
        }, 300);

        win.on('will-resize', (e, bounds) => updateBounds(bounds));
        win.on('will-move', (e, bounds) => updateBounds(bounds));

        // load the localhost website
        win.loadURL(`http://localhost:${port}`);

        if (process.env.NODE_ENV === 'dev') {
            win.webContents.openDevTools();
        }
    }
}
