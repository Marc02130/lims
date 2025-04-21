"""Create auth tables

Revision ID: 82cdc7471e9f
Revises: 2025_04_17
Create Date: 2025-04-17 12:43:07.251132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82cdc7471e9f'
down_revision: Union[str, None] = '2025_04_17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
