//! Opaque bearer tokens (cart and session cookies). Only the SHA-256 hash is stored.

use sha2::{Digest, Sha256};
use uuid::Uuid;

/// 244 bits of OS randomness (two v4 UUIDs), hex encoded.
pub fn generate() -> String {
    format!("{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple())
}

pub fn hash(token: &str) -> String {
    hex::encode(Sha256::digest(token.as_bytes()))
}

#[cfg(test)]
mod tests {
    #[test]
    fn tokens_are_unique_and_hash_stably() {
        let a = super::generate();
        let b = super::generate();
        assert_ne!(a, b);
        assert_eq!(a.len(), 64);
        assert_eq!(super::hash(&a), super::hash(&a));
        assert_ne!(super::hash(&a), a);
    }
}
