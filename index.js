// Import node modules
import express from 'express';
import cron from 'node-cron';
import logger from './utils/logger.js';

// Import express routers
import companyRouter from './routes/companyRouter.mjs'
import listingRouter from './routes/listingRouter.mjs'
import clientRouter from './routes/clientRouter.mjs'
import adminRouter from './routes/adminRouter.mjs'

// Import utils/services/misc
import * as scraperService from './services/scraperService.mjs';
import { __dirname } from './utils/paths.mjs'

// Create express server and define env variables
const app = express();
const PORT = process.env.PORT || 3000

// Configure ejs views
app.set('view engine', 'ejs')

// Use parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add a static directory for public files (js, css, etc)
app.use(express.static('public'));

// Add routers
app.use('/admin', adminRouter);
app.use('/company', companyRouter);
app.use('/listing', listingRouter);
app.use('/', clientRouter);

// Custom error class for application errors
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
app.use((req, res, next) => {
    next(new AppError(404, 'Page not found'));
});

// Handle specific error types
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error details
    logger.error('Error occurred:', {
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Send error response
    res.status(err.statusCode).render('error', {
        error: err.statusCode,
        message: err.message || 'Something went wrong!'
    });
});

// Schedule webscrape task
// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const allJobs = await scraperService.scrapeAllJobs();
    const addedJobs = await scraperService.addManyUnique(allJobs);
    logger.info('Jobs added successfully:', { count: addedJobs.length });
  } catch (error) {
    logger.error('Error in scheduled job:', error);
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`);
})