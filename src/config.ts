// ============================================================
// EDIT THESE 4 VALUES FIRST. Everything else reads from here.
// ============================================================
export const FULL_NAME = 'Solomon Kamara';
export const REG_NUMBER = '2423982';
export const APP_NAME = 'SolomonPortfolio';
export const APP_VERSION = '1.0.0';
export const CONTACT_EMAIL = 'kamara164@gmail.com';
export const CONTACT_PHONE = '0792405593';

// Last four digits of registration number -> MOB-A2-LLLL
const digits = REG_NUMBER.replace(/\D/g, '');
export const VERIFICATION_CODE = digits.length >= 4 ? `MOB-A2-${digits.slice(-4)}` : 'MOB-A2-LLLL';
export const REG_DIGITS = digits;

export const INTRO_SENTENCE = `My name is ${FULL_NAME}.`;
