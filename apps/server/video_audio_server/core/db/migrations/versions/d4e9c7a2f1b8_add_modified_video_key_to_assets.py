"""add modified_video_key to assets

Revision ID: d4e9c7a2f1b8
Revises: 3a8f2b1c9d47
Create Date: 2026-04-28 18:00:00.000000

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = "d4e9c7a2f1b8"
down_revision: Union[str, None] = "c2f4e8b1a6d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("assets", sa.Column("modified_video_key", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("assets", "modified_video_key")
