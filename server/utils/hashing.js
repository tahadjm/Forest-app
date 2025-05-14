import { createHmac } from 'crypto';
import bcrypt from 'bcryptjs';

const { hash, compare } = bcrypt;

export const doHash = async (value, saltValue) => {
	const result = await hash(value, saltValue);
	return result;
};

export const doHashValidation = async (value, hashedValue) => {
	const result = await compare(value, hashedValue);
	return result;
};

export const hmacProcess = (value, key) => {
	const result = createHmac('sha256', key).update(value).digest('hex');
	return result;
};
