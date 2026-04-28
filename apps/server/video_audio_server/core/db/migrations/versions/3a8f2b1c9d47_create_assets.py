"""create assets

Revision ID: 3a8f2b1c9d47
Revises: 9c41fca68654
Create Date: 2026-04-28 12:00:00.000000

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = "3a8f2b1c9d47"
down_revision: Union[str, None] = "9c41fca68654"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "assets",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("original_filename", sa.String(), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("duration_sec", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("video_key", sa.Text(), nullable=True),
        sa.Column("audio_key", sa.Text(), nullable=True),
        sa.Column("modified_audio_key", sa.Text(), nullable=True),
        sa.Column("peaks_key", sa.Text(), nullable=True),
        sa.Column("thumbnail_key", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("assets")
