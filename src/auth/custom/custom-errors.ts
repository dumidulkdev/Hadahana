export const CustomErrors = {
  EmailAlreadyExists: {
    error: true,
    message: 'User already exixts with this email',
    error_code: 'BAD_REQUEST',
  },
  UserEmailNotFound: {
    error: true,
    message: 'This email is not registerd with our system',
    error_code: 'NOT_FOUND',
  },
  WrongCredentials: {
    error: true,
    message: 'Credentials are wrong',
    error_code: 'INVALID_CREDENTIALS',
  },
  Unauthorized: {
    error: true,
    message: 'Unauthorized',
    error_code: 'MALICIOUS_REQUEST',
  },
};
