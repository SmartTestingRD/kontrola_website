import crypto from 'crypto';

/**
 * Verify a password against a Django pbkdf2_sha256 hash
 * Format: pbkdf2_sha256$iterations$salt$hash
 */
export function verifyDjangoPassword(password: string, djangoHash: string): boolean {
    try {
        const parts = djangoHash.split('$');
        if (parts.length !== 4) return false;

        const algorithm = parts[0];
        const iterations = parseInt(parts[1], 10);
        const salt = parts[2];
        const storedHash = parts[3];

        if (algorithm !== 'pbkdf2_sha256') {
            console.warn(`Unsupported algorithm: ${algorithm}`);
            return false;
        }

        // Generate the hash using Node's crypto with the identical parameters
        const derivedKey = crypto.pbkdf2Sync(
            password,
            salt,
            iterations,
            32, // sha256 output length
            'sha256'
        );

        const computedHash = derivedKey.toString('base64');
        console.log({ computedHash, storedHash });
        return computedHash === storedHash;
    } catch (e) {
        console.error("Error verifying password context:", e);
        return false;
    }
}
