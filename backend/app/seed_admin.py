import os

from dotenv import load_dotenv

from app.db import get_users
from app.services.auth_service import seed_admin


def main() -> None:
    load_dotenv()
    email = os.environ["ADMIN_EMAIL"]
    password = os.environ["ADMIN_PASSWORD"]
    seed_admin(get_users(), email, password)


if __name__ == "__main__":
    main()
