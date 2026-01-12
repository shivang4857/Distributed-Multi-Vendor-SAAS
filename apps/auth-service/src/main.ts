import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger-output.json';
const app = express();
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:4202',
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use(cookieParser());


app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
    res.json(swaggerDocument);
});
app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`Auth is service is running at  http://localhost:${port}/api`);
    console.log(`API documentation is available at http://localhost:${port}/api-docs`);
});
server.on('error', console.error);
