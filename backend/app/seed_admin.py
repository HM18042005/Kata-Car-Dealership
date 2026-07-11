import os
import sys

from dotenv import load_dotenv

from app.db import get_users
from app.services.auth_service import AdminEmailTakenError, seed_admin


def main() -> None:
    load_dotenv()
    email = os.environ["ADMIN_EMAIL"]
    password = os.environ["ADMIN_PASSWORD"]
    try:
        seed_admin(get_users(), email, password)
    except AdminEmailTakenError:
        print(f"ADMIN_EMAIL {email!r} is already registered as a non-admin user.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
