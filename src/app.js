import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import createRouter from './routes';
import errorResponder from './middleware/error-responder';
import errorLogger from './middleware/error-logger';

function createApp() {
  const app = express();

  // Heroku's load balancer can be trusted
  app.enable('trust proxy');
  app.disable('x-powered-by');

  const isVerboseTests =
    process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS === 'true';
  if (process.env.NODE_ENV === 'development' || isVerboseTests) {
    app.use(morgan('dev'));
  }

  // Dev and test
  if (process.env.NODE_ENV !== 'production') {
    // Pretty print JSON responses
    app.set('json spaces', 2);

    // Disable caching for easier testing
    app.use(function noCache(req, res, next) {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', 0);
      next();
    });
  }

  app.use(function defaultContentType(req, res, next) {
    const defaultType = 'application/json';
    req.headers['content-type'] = req.headers['content-type'] ||
      defaultType;
    next();
  });

  app.use(bodyParser.json());
  app.use(cors());
  app.use(compression({
    // Compress everything over 10 bytes
    threshold: 10
  }));

  // Initialize routes
  const router = createRouter();
  app.use('/api', router);

  app.use(errorLogger({  }));
  app.use(errorResponder());

  return app;
}

export default createApp;
