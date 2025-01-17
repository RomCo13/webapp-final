import dotenv from 'dotenv';

beforeAll(() => {
    dotenv.config({ path: '.env.test' });
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret';
    process.env.JWT_EXPIRATION = '1h';
}); 