import pytest

from app.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_password_does_not_return_the_plaintext():
    assert hash_password("hunter2") != "hunter2"


def test_verify_password_accepts_the_matching_plaintext():
    hashed = hash_password("hunter2")
    assert verify_password("hunter2", hashed) is True


def test_verify_password_rejects_the_wrong_plaintext():
    hashed = hash_password("hunter2")
    assert verify_password("wrong-password", hashed) is False


def test_access_token_round_trips_subject_and_role():
    token = create_access_token({"sub": "665f1c1a2b3c4d5e6f7a8b9c", "role": "admin"})
    payload = decode_access_token(token)
    assert payload["sub"] == "665f1c1a2b3c4d5e6f7a8b9c"
    assert payload["role"] == "admin"


def test_decode_access_token_rejects_a_malformed_token():
    with pytest.raises(Exception):
        decode_access_token("not-a-real-token")
